package com.haui.vtech.service;

import com.haui.vtech.dto.user.ProfileUpdateRequest;
import com.haui.vtech.dto.user.ProfileUpdateResponse;
import com.haui.vtech.dto.user.UserCreationRequest;
import com.haui.vtech.dto.user.UserResponse;
import com.haui.vtech.entity.RoleEntity;
import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.enums.Role;
import com.haui.vtech.enums.UserStatus;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.UserMapper;
import com.haui.vtech.repository.RoleRepository;
import com.haui.vtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
//    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse create(UserCreationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXSISTED, request.getEmail());
        }

        UserEntity newUser = userMapper.toEntity(request);
//        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        Set<RoleEntity> roles = new HashSet<>();
        RoleEntity role = roleRepository.findByName(Role.USER.name())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        roles.add(role);
        newUser.setRoles(roles);

        UserEntity savedUser = userRepository.save(newUser);
        return userMapper.toUserResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findByStatus(UserStatus.ACTIVE).stream().map(userMapper::toUserResponse).toList();
    }

    @Override
    public UserResponse getById(String id) {
        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
    }

    @Override
    public ProfileUpdateResponse updateProfile(String id, ProfileUpdateRequest request) {
        UserEntity userEntity = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateUser(userEntity, request);
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {

            Set<String> roleNames = request.getRoles();
            List<RoleEntity> roleEntities = roleRepository.findByNameIn(roleNames);

            if (roleEntities.size() != roleNames.size()) {
                throw new AppException(ErrorCode.ROLE_NOT_FOUND);
            }

            userEntity.setRoles(new HashSet<>(roleEntities));
        }


        return userMapper.toProfileUpdateResponse(userRepository.save(userEntity));
    }

    @Override
    public void delete(String id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // TODO: Kiểm tra nếu user đang xóa là chính mình thì không cho xóa
//        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
//        if (user.getEmail().equals(currentUserEmail)) {
//            throw new AppException(ErrorCode.CANNOT_DELETE_SELF);
//        }

        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteSoft(String id) {
        int affectedRows  = userRepository.softDelete(id, LocalDateTime.now());

        if (affectedRows  == 0) {
            throw new AppException(ErrorCode.USER_NOT_FOUND, id);
        }
    }

    @Override
    public List<UserResponse> getAllInTrash() {
        return userRepository.findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(UserStatus.INACTIVE)
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

}
