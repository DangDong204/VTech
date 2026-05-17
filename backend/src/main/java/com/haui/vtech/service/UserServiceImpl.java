package com.haui.vtech.service;

import com.haui.vtech.dto.auth.ResetPasswordRequest;
import com.haui.vtech.dto.user.*;
import com.haui.vtech.entity.RoleEntity;
import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.enums.ImageFolder;
import com.haui.vtech.enums.Role;
import com.haui.vtech.enums.UserStatus;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.UserMapper;
import com.haui.vtech.repository.OrderRepository;
import com.haui.vtech.repository.ReviewRepository;
import com.haui.vtech.repository.RoleRepository;
import com.haui.vtech.repository.UserRepository;
import com.haui.vtech.util.OtpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final S3Service s3Service;
    private final PasswordEncoder passwordEncoder;
    private final OtpUtil otpUtil;
    private final EmailService emailService;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional
    public UserResponse create(UserCreationRequest request) {
        // 1. Tìm xem email đã tồn tại trong DB chưa
        Optional<UserEntity> existingUserOpt = userRepository.findByEmail(request.getEmail());

        UserEntity userToSave;

        if (existingUserOpt.isPresent()) {
            userToSave = existingUserOpt.get();

            // Nếu tài khoản đã xác thực hoặc bị khóa -> Chặn luôn
            if (userToSave.getStatus() != UserStatus.PENDING) {
                throw new AppException(ErrorCode.EMAIL_EXSISTED, request.getEmail());
            }

            // Nếu PENDING (đăng ký dở dang) -> Cập nhật lại thông tin mới nhất họ vừa nhập
            userToSave.setUsername(request.getUsername());
            userToSave.setPassword(passwordEncoder.encode(request.getPassword()));

            userToSave.setFullName(request.getFullName());
            userToSave.setDob(request.getDob());
            userToSave.setGender(request.getGender());
            userToSave.setPhone(request.getPhone());

        } else {
            // Nếu là Email mới tinh -> Tạo mới bình thường
            userToSave = userMapper.toEntity(request);
            userToSave.setPassword(passwordEncoder.encode(userToSave.getPassword()));

            Set<RoleEntity> roles = new HashSet<>();
            RoleEntity role = roleRepository.findByName(Role.USER.name())
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
            roles.add(role);
            userToSave.setRoles(roles);
        }

        String otp = otpUtil.generateOtp();
        userToSave.setOtpCode(otp);
        userToSave.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5));

        UserEntity savedUser = userRepository.save(userToSave);

        // 3. Bắn Mail
        emailService.sendOtpEmail(savedUser.getEmail(), otp);

        return userMapper.toUserResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findByStatusNot(UserStatus.DELETED).stream().map(userMapper::toUserResponse).toList();
    }

    @Override
    public UserResponse getById(String id) {
        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
    }

    @Override
    public ProfileUpdateResponse updateProfile(String id, ProfileUpdateRequest request, MultipartFile file) {
        UserEntity userEntity = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 1. Lấy email của người đang thao tác (Admin đang đăng nhập)
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isSelf = userEntity.getEmail().equals(currentUserEmail);

        // 2. Chặn tự khóa tài khoản của chính mình
        if (isSelf && request.getStatus() != null && !userEntity.getStatus().equals(request.getStatus())) {
            throw new AppException(ErrorCode.CANNOT_CHANGE_OWN_STATUS);
        }

        userMapper.updateUser(userEntity, request);

        if (file != null && !file.isEmpty()) {
            String imageUrl = s3Service.uploadImage(file, ImageFolder.USER);
            userEntity.setAvatar(imageUrl);
        }

        // 3. Xử lý cập nhật quyền
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<String> newRoles = request.getRoles();

            // Lấy danh sách quyền hiện tại của user đang bị sửa
            Set<String> currentRoles = userEntity.getRoles().stream()
                    .map(RoleEntity::getName)
                    .collect(Collectors.toSet());

            // Nếu Quyền có sự thay đổi
            if (!currentRoles.equals(newRoles)) {
                // CHẶN: Nếu tự sửa quyền của chính mình
                if (isSelf) {
                    throw new AppException(ErrorCode.CANNOT_CHANGE_OWN_ROLE);
                }

                // HỢP LỆ: Cập nhật quyền cho người khác
                List<RoleEntity> roleEntities = roleRepository.findByNameIn(newRoles);

                if (roleEntities.size() != newRoles.size()) {
                    throw new AppException(ErrorCode.ROLE_NOT_FOUND);
                }

                userEntity.setRoles(new HashSet<>(roleEntities));
            }
        }


        return userMapper.toProfileUpdateResponse(userRepository.save(userEntity));
    }

    @Override
    public void delete(String id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // TODO: Kiểm tra nếu user đang xóa là chính mình thì không cho xóa
        checkIfUserIsDeletable(user);

        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteSoft(String id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        checkIfUserIsDeletable(user);

        int affectedRows  = userRepository.softDelete(id, LocalDateTime.now());

        if (affectedRows  == 0) {
            throw new AppException(ErrorCode.USER_NOT_FOUND, id);
        }
    }

    @Override
    public List<UserResponse> getAllInTrash() {
        return userRepository.findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(UserStatus.DELETED)
                .stream().map(userMapper::toUserResponse).toList();
    }

    @Override
    @Transactional
    public void restore(String id) {
        int affectedRows = userRepository.restore(id);

        if (affectedRows == 0) {
            throw new AppException(ErrorCode.USER_NOT_FOUND, id);
        }
    }

    @Override
    public UserResponse getMyProfile(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.OLD_PASSWORD_INVALID);
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.NEW_PASSWORD_SAME_AS_OLD);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void verifyOtp(String email, String otpCode) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // CHẶN BỊ KHÓA HOẶC ĐÃ XÓA
        if (user.getStatus() == UserStatus.INACTIVE || user.getStatus() == UserStatus.DELETED) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        // KIỂM TRA MÃ OTP VÀ HẠN
        if (user.getOtpExpiryTime() == null || user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (!otpCode.equals(user.getOtpCode())) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        // --- XỬ LÝ LƯU DB TÙY THEO TRẠNG THÁI ---
        if (user.getStatus() == UserStatus.PENDING) {
            // NẾU LÀ LUỒNG ĐĂNG KÝ: Chuyển sang ACTIVE và xóa OTP
            user.setStatus(UserStatus.ACTIVE);
            user.setOtpCode(null);
            user.setOtpExpiryTime(null);
            userRepository.save(user);
        } else if (user.getStatus() == UserStatus.ACTIVE) {
            // NẾU LÀ LUỒNG QUÊN MẬT KHẨU: CHỈ XÁC NHẬN MÃ ĐÚNG, KHÔNG XÓA OTP!
            // Giữ nguyên OTP để lát nữa API resetPassword còn lấy để xác minh lại 1 lần nữa!
            // Do nothing here.
        }
    }

    @Override
    @Transactional
    public void resendOtp(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() != UserStatus.PENDING) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_VERIFIED);
        }

        // Sinh lại mã mới và gia hạn thêm 5 phút
        String newOtp = otpUtil.generateOtp();
        user.setOtpCode(newOtp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        // Gửi mail mới
        emailService.sendOtpEmail(user.getEmail(), newOtp);
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        // 1. Kiểm tra user
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Nếu tài khoản đang PENDING (chưa xác thực email) hoặc BLOCKED thì không cho đổi mật khẩu
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        // 2. Sinh OTP và set hạn 5 phút
        String otp = otpUtil.generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        // 3. Gửi email forgot password
        emailService.sendForgotPasswordEmail(user.getEmail(), otp);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // 1. Kiểm tra 2 mật khẩu có khớp nhau không
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        // 2. Lấy User và kiểm tra OTP y hệt như luồng Đăng ký
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        if (user.getOtpExpiryTime() == null || user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (!request.getOtpCode().equals(user.getOtpCode())) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        // 3. OTP hợp lệ -> Đổi mật khẩu và xóa sạch OTP cũ
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public ProfileUpdateResponse updateMyProfile(String email, MyProfileUpdateRequest request, MultipartFile file) {
        // 1. Tìm user bằng email (lấy từ Token)
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Chỉ cập nhật các trường được phép
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());

        // 3. Xử lý upload avatar (nếu có file gửi lên)
        if (file != null && !file.isEmpty()) {
            String imageUrl = s3Service.uploadImage(file, ImageFolder.USER);
            user.setAvatar(imageUrl);
        }

        // 4. Lưu lại và trả về response
        return userMapper.toProfileUpdateResponse(userRepository.save(user));
    }

    private void checkIfUserIsDeletable(UserEntity user) {
        // 1. Kiểm tra nếu user đang xóa là chính mình thì không cho xóa
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (user.getEmail().equals(currentUserEmail)) {
            throw new AppException(ErrorCode.CANNOT_DELETE_SELF);
        }

        // 2. Chặn xóa nếu có Đơn hàng
        if (orderRepository.existsByUserId(user.getId())) {
            throw new AppException(ErrorCode.USER_HAS_ORDERS, user.getEmail());
        }

        // 3. Chặn xóa nếu có Đánh giá
        if (reviewRepository.existsByUserId(user.getId())) {
            throw new AppException(ErrorCode.USER_HAS_REVIEWS, user.getEmail());
        }
    }
}
