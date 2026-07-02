package com.dsaroadmap.config;

import com.dsaroadmap.models.ContactInfo;
import com.dsaroadmap.repositories.ContactInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ContactSeeder implements CommandLineRunner {

    private final ContactInfoRepository contactInfoRepository;

    @Override
    public void run(String... args) throws Exception {
        if (contactInfoRepository.count() == 0) {
            ContactInfo whatsapp = ContactInfo.builder()
                    .platform("WHATSAPP")
                    .value("+918885364091")
                    .link("https://wa.me/918885364091")
                    .build();

            ContactInfo instagram = ContactInfo.builder()
                    .platform("INSTAGRAM")
                    .value("@satyasai___vanapalli")
                    .link("https://www.instagram.com/satyasai___vanapalli/")
                    .build();

            ContactInfo gmail = ContactInfo.builder()
                    .platform("GMAIL")
                    .value("satyasaivanapalli47@gmail.com")
                    .link("satyasaivanapalli47@gmail.com")
                    .build();

            contactInfoRepository.saveAll(List.of(whatsapp, instagram, gmail));
            System.out.println("Seeded initial contact information.");
        }
    }
}
