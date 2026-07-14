package com.healthflow.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final Long clinicId;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean isActive;

    public UserPrincipal(Long id, Long clinicId, String email, String password, String roleName, boolean isActive) {
        this.id = id;
        this.clinicId = clinicId;
        this.email = email;
        this.password = password;
        this.isActive = isActive;
        // In Spring Security, roles are traditionally prefixed with 'ROLE_'
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + roleName));
    }

    public Long getClinicId() {
        return clinicId;
    }

    public Long getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
