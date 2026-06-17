package com.shopnest.backend.service.impl;

import com.shopnest.backend.dto.address.AddressRequest;
import com.shopnest.backend.dto.address.AddressResponse;
import com.shopnest.backend.entity.Address;
import com.shopnest.backend.entity.User;
import com.shopnest.backend.exception.ResourceNotFoundException;
import com.shopnest.backend.repository.AddressRepository;
import com.shopnest.backend.service.AddressService;
import com.shopnest.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses() {
        Long userId = SecurityUtils.getCurrentUserId();
        return addressRepository.findByUserId(userId).stream()
                .map(AddressResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public AddressResponse createAddress(AddressRequest request) {
        User user = SecurityUtils.getCurrentUser();

        Address address = Address.builder()
                .user(user)
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .phone(request.getPhone())
                .country(request.getCountry() != null ? request.getCountry() : "India")
                .build();

        Address saved = addressRepository.save(address);
        log.info("Address created: id={} for user {}", saved.getId(), user.getEmail());
        return AddressResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteAddress(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", id));

        // Verify ownership
        Long userId = SecurityUtils.getCurrentUserId();
        if (!address.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Address", id);
        }

        addressRepository.delete(address);
        log.info("Address deleted: id={}", id);
    }
}
