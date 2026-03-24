package com.haui.vtech.service;

import com.haui.vtech.dto.user.UserCreationRequest;
import com.haui.vtech.dto.user.UserResponse;
import com.haui.vtech.entity.RoleEntity;
import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.enums.Role;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.UserMapper;
import com.haui.vtech.repository.RoleRepository;
import com.haui.vtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
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
}
