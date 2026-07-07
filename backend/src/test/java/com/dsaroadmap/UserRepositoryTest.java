package com.dsaroadmap;

import com.dsaroadmap.repositories.UserRepository;
import com.dsaroadmap.models.User;
import com.dsaroadmap.models.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testLeaderboardQuery() {
        User u = new User();
        u.setEmail("test@test.com");
        u.setPassword("pass");
        u.setName("Test");
        u.setRole(Role.STUDENT);
        userRepository.save(u);

        var list = userRepository.getLeaderboardByCategory("PRACTICE", PageRequest.of(0, 50));
        assertNotNull(list);
        System.out.println("Result count: " + list.size());
        if (list.size() > 0) {
            System.out.println("User completed: " + list.get(0).getCompletedCount());
        }
    }
}
