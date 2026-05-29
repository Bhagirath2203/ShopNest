package com.shopnest.backend.service;

import com.shopnest.backend.dto.address.AddressRequest;
import com.shopnest.backend.dto.address.AddressResponse;

import java.util.List;

public interface AddressService {

    List<AddressResponse> getUserAddresses();

    AddressResponse createAddress(AddressRequest request);

    void deleteAddress(Long id);
}
