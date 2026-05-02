package com.haui.vtech.service;

import com.haui.vtech.dto.vpoint.VpointHistoryResponse;
import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.entity.VpointHistoryEntity;
import com.haui.vtech.enums.MemberTier;
import com.haui.vtech.enums.VpointTransactionType;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.VpointMapper;
import com.haui.vtech.repository.UserRepository;
import com.haui.vtech.repository.VpointHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value; // BỔ SUNG
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VpointServiceImpl implements VpointService {

    private final UserRepository userRepository;
    private final VpointHistoryRepository vpointHistoryRepository;
    private final VpointMapper vpointMapper;

    @Value("${app.vpoint.tier.silver:1000}")
    private int silverThreshold;

    @Value("${app.vpoint.tier.gold:5000}")
    private int goldThreshold;

    @Value("${app.vpoint.tier.diamond:20000}")
    private int diamondThreshold;

    @Override
    @Transactional
    public void addPoints(String userId, int amount, VpointTransactionType type, String referenceId, String description) {
        if (amount <= 0) {
            throw new AppException(ErrorCode.VPOINT_INVALID_AMOUNT);
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setCurrentVpoint(user.getCurrentVpoint() + amount);
        user.setTotalVpoint(user.getTotalVpoint() + amount);

        int total = user.getTotalVpoint();
        MemberTier newTier = MemberTier.MEMBER;
        if (total >= diamondThreshold) {
            newTier = MemberTier.DIAMOND;
        } else if (total >= goldThreshold) {
            newTier = MemberTier.GOLD;
        } else if (total >= silverThreshold) {
            newTier = MemberTier.SILVER;
        }

        if (user.getMemberTier() != newTier) {
            log.info("User {} upgraded to tier {}", user.getEmail(), newTier);
            user.setMemberTier(newTier);
        }

        userRepository.save(user);

        VpointHistoryEntity history = VpointHistoryEntity.builder()
                .user(user)
                .amount(amount)
                .transactionType(type)
                .referenceId(referenceId)
                .description(description)
                .build();

        vpointHistoryRepository.save(history);
    }

    @Override
    @Transactional
    public void deductPoints(String userId, int amount, VpointTransactionType type, String referenceId, String description) {
        if (amount <= 0) {
            throw new AppException(ErrorCode.VPOINT_INVALID_AMOUNT);
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setCurrentVpoint(user.getCurrentVpoint() - amount);

        int total = user.getTotalVpoint();
        MemberTier newTier = MemberTier.MEMBER;
        if (total >= diamondThreshold) {
            newTier = MemberTier.DIAMOND;
        } else if (total >= goldThreshold) {
            newTier = MemberTier.GOLD;
        } else if (total >= silverThreshold) {
            newTier = MemberTier.SILVER;
        }

        if (user.getMemberTier() != newTier) {
            log.info("User {} downgraded to tier {}", user.getEmail(), newTier);
            user.setMemberTier(newTier);
        }

        userRepository.save(user);

        VpointHistoryEntity history = VpointHistoryEntity.builder()
                .user(user)
                .amount(-amount)
                .transactionType(type)
                .referenceId(referenceId)
                .description(description)
                .build();

        vpointHistoryRepository.save(history);
    }

    @Override
    public List<VpointHistoryResponse> getUserHistory(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        return vpointHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(vpointMapper::toResponse)
                .toList();
    }
}