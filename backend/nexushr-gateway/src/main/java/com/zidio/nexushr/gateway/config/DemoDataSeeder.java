package com.zidio.nexushr.gateway.config;

import com.zidio.nexushr.auth.entity.Role;
import com.zidio.nexushr.auth.entity.User;
import com.zidio.nexushr.auth.repository.RoleRepository;
import com.zidio.nexushr.auth.repository.UserRepository;
import com.zidio.nexushr.employee.entity.Attendance;
import com.zidio.nexushr.employee.entity.Department;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.entity.Leave;
import com.zidio.nexushr.employee.entity.LeaveBalance;
import com.zidio.nexushr.employee.repository.AttendanceRepository;
import com.zidio.nexushr.employee.repository.DepartmentRepository;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import com.zidio.nexushr.employee.repository.LeaveBalanceRepository;
import com.zidio.nexushr.employee.repository.LeaveRepository;
import com.zidio.nexushr.performance.entity.Goal;
import com.zidio.nexushr.performance.repository.GoalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRepository leaveRepository;
    private final AttendanceRepository attendanceRepository;
    private final GoalRepository goalRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(UserRepository userRepository,
                          RoleRepository roleRepository,
                          DepartmentRepository departmentRepository,
                          EmployeeRepository employeeRepository,
                          LeaveBalanceRepository leaveBalanceRepository,
                          LeaveRepository leaveRepository,
                          AttendanceRepository attendanceRepository,
                          GoalRepository goalRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveRepository = leaveRepository;
        this.attendanceRepository = attendanceRepository;
        this.goalRepository = goalRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking and seeding NexusHR standard demo personas...");

        Role roleSuperAdmin = ensureRole("ROLE_SUPER_ADMIN", "Super Administrator with full root access");
        Role roleAdmin = ensureRole("ROLE_ADMIN", "HR Administrator with full staff lifecycle access");
        Role roleManager = ensureRole("ROLE_MANAGER", "Team Manager with direct report approvals");
        Role roleEmployee = ensureRole("ROLE_EMPLOYEE", "Standard Employee with self-service features");
        Role roleExecutive = ensureRole("ROLE_EXECUTIVE", "Executive / C-Suite read-only analytics");

        Department execDept = ensureDepartment("Executive Leadership", "Strategic & Executive Direction");
        Department engDept = ensureDepartment("Engineering", "Software Architecture & System Engineering");
        Department hrDept = ensureDepartment("Human Resources", "People Operations & Talent");
        Department opsDept = ensureDepartment("DevOps & Infrastructure", "Cloud Architecture & Observability");

        String defaultDemoPassword = passwordEncoder.encode("Demo@12345");

        // 1. Executive / CHRO: Ananya Sen
        User chroUser = ensureUser("chro@nexushr.demo", defaultDemoPassword, roleExecutive);
        Employee chroEmp = ensureEmployee(chroUser, "NX-0001", "Ananya", "Sen", "chro@nexushr.demo",
                "Chief Human Resources Officer", execDept, new BigDecimal("4800000.00"), null);

        // 2. Manager: Vikram Patel
        User mgrUser = ensureUser("manager@nexushr.demo", defaultDemoPassword, roleManager);
        Employee mgrEmp = ensureEmployee(mgrUser, "NX-0002", "Vikram", "Patel", "manager@nexushr.demo",
                "Engineering Manager", engDept, new BigDecimal("3200000.00"), chroEmp);

        // 3. Employee: Aditi Sharma
        User empUser = ensureUser("employee@nexushr.demo", defaultDemoPassword, roleEmployee);
        Employee aditiEmp = ensureEmployee(empUser, "NX-0003", "Aditi", "Sharma", "employee@nexushr.demo",
                "Senior Software Developer", engDept, new BigDecimal("1800000.00"), mgrEmp);

        // 4. HR Admin: Priya Nair
        User hrUser = ensureUser("hr@nexushr.demo", defaultDemoPassword, roleAdmin);
        ensureEmployee(hrUser, "NX-0004", "Priya", "Nair", "hr@nexushr.demo",
                "Lead HR Business Partner", hrDept, new BigDecimal("2200000.00"), chroEmp);

        // 5. SysAdmin: Rahul Verma
        User sysUser = ensureUser("sysadmin@nexushr.demo", defaultDemoPassword, roleSuperAdmin);
        ensureEmployee(sysUser, "NX-0005", "Rahul", "Verma", "sysadmin@nexushr.demo",
                "Principal DevOps & Systems Architect", opsDept, new BigDecimal("2600000.00"), chroEmp);

        // Ensure admin@nexushr.corp as backward-compatible super admin
        if (!userRepository.existsByEmail("admin@nexushr.corp")) {
            User adminCorp = ensureUser("admin@nexushr.corp", passwordEncoder.encode("Nexus@Admin2026"), roleAdmin);
            adminCorp.getRoles().add(roleSuperAdmin);
            adminCorp.getRoles().add(roleManager);
            userRepository.save(adminCorp);
        }

        // Ensure admin@nexushr.com with Admin@123
        if (!userRepository.existsByEmail("admin@nexushr.com")) {
            User adminCom = ensureUser("admin@nexushr.com", passwordEncoder.encode("Admin@123"), roleSuperAdmin);
            adminCom.getRoles().add(roleAdmin);
            adminCom.getRoles().add(roleManager);
            userRepository.save(adminCom);
        }

        // Seed Pending Leave Requests for Aditi (so Vikram has pending items in his manager queue)
        seedPendingLeaves(aditiEmp);

        // Seed Today's Attendance for Aditi
        seedTodayAttendance(aditiEmp);

        // Seed OKR Goals for Aditi
        seedGoals(aditiEmp);

        log.info("NexusHR Demo Personas successfully seeded and verified!");
    }

    private void seedPendingLeaves(Employee emp) {
        LocalDate start1 = LocalDate.now().plusDays(4);
        LocalDate end1 = LocalDate.now().plusDays(6);
        if (leaveRepository.findOverlappingLeaves(emp.getId(), start1, end1).isEmpty()) {
            Leave l1 = new Leave();
            l1.setEmployee(emp);
            l1.setLeaveType("CASUAL");
            l1.setStartDate(start1);
            l1.setEndDate(end1);
            l1.setReason("Family Wedding Ceremony");
            l1.setStatus("PENDING");
            leaveRepository.save(l1);
        }

        LocalDate start2 = LocalDate.now().plusDays(15);
        LocalDate end2 = LocalDate.now().plusDays(18);
        if (leaveRepository.findOverlappingLeaves(emp.getId(), start2, end2).isEmpty()) {
            Leave l2 = new Leave();
            l2.setEmployee(emp);
            l2.setLeaveType("EARNED");
            l2.setStartDate(start2);
            l2.setEndDate(end2);
            l2.setReason("Annual Vacation & Tech Conference");
            l2.setStatus("PENDING");
            leaveRepository.save(l2);
        }
    }

    private void seedTodayAttendance(Employee emp) {
        LocalDate today = LocalDate.now();
        if (attendanceRepository.findByEmployeeIdAndDate(emp.getId(), today).isEmpty()) {
            Attendance att = new Attendance();
            att.setEmployee(emp);
            att.setDate(today);
            att.setClockIn(LocalDateTime.now().withHour(9).withMinute(18));
            att.setStatus("PRESENT");
            att.setWorkHours(4.2);
            attendanceRepository.save(att);
        }
    }

    private void seedGoals(Employee emp) {
        if (goalRepository.findByEmployeeId(emp.getId()).isEmpty()) {
            Goal g1 = new Goal();
            g1.setEmployee(emp);
            g1.setTitle("Migrate Auth Pipeline to Argon2 & Hash-Chained Audits");
            g1.setDescription("Upgrade cryptographic identity layer and implement immutable SHA-256 audit trails.");
            g1.setStartDate(LocalDate.now().minusMonths(1));
            g1.setEndDate(LocalDate.now().plusMonths(2));
            g1.setCompletionPercentage(90);
            g1.setStatus("IN_PROGRESS");
            goalRepository.save(g1);

            Goal g2 = new Goal();
            g2.setEmployee(emp);
            g2.setTitle("Real-time STOMP & Redis Attendance Architecture");
            g2.setDescription("Implement distributed WebSocket event push for punch actions and approvals.");
            g2.setStartDate(LocalDate.now().minusMonths(2));
            g2.setEndDate(LocalDate.now().plusMonths(1));
            g2.setCompletionPercentage(75);
            g2.setStatus("IN_PROGRESS");
            goalRepository.save(g2);
        }
    }

    private Role ensureRole(String roleName, String description) {
        return roleRepository.findByName(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setName(roleName);
            role.setDescription(description);
            return roleRepository.save(role);
        });
    }

    private Department ensureDepartment(String name, String description) {
        return departmentRepository.findByName(name).orElseGet(() -> {
            Department dept = new Department();
            dept.setName(name);
            dept.setDescription(description);
            return departmentRepository.save(dept);
        });
    }

    private User ensureUser(String email, String encodedPassword, Role primaryRole) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User user = existing.get();
            if (!user.getRoles().contains(primaryRole)) {
                user.getRoles().add(primaryRole);
                userRepository.save(user);
            }
            return user;
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPasswordHash(encodedPassword);
        newUser.setActive(true);
        newUser.setFailedAttempts(0);
        newUser.setMustChangePassword(false);
        newUser.getRoles().add(primaryRole);
        return userRepository.save(newUser);
    }

    private Employee ensureEmployee(User user, String empCode, String firstName, String lastName,
                                    String email, String designation, Department dept,
                                    BigDecimal ctc, Employee manager) {
        Optional<Employee> existing = employeeRepository.findByEmail(email);
        if (existing.isPresent()) {
            Employee emp = existing.get();
            if (emp.getManager() == null && manager != null) {
                emp.setManager(manager);
                employeeRepository.save(emp);
            }
            return emp;
        }

        Employee emp = new Employee();
        emp.setUserId(user.getId());
        emp.setEmployeeCode(empCode);
        emp.setFirstName(firstName);
        emp.setLastName(lastName);
        emp.setEmail(email);
        emp.setDesignation(designation);
        emp.setDepartment(dept);
        emp.setSalary(ctc);
        emp.setManager(manager);
        emp.setHireDate(LocalDate.now().minusMonths(14));
        emp.setStatus("ACTIVE");

        emp.setMetadata("{\"emergencyContact\":\"9876543210\",\"stateCode\":\"MH\",\"workLocation\":\"Mumbai Tech Hub\"}");

        Employee saved = employeeRepository.save(emp);

        // Ensure Leave Balance initialized for current year
        int currentYear = LocalDate.now().getYear();
        Optional<LeaveBalance> existingBalance = leaveBalanceRepository.findByEmployeeIdAndYear(saved.getId(), currentYear);
        if (existingBalance.isEmpty()) {
            LeaveBalance balance = new LeaveBalance();
            balance.setEmployee(saved);
            balance.setYear(currentYear);
            balance.setCasualLeave(12);
            balance.setEarnedLeave(15);
            balance.setSickLeave(10);
            balance.setMaternityLeave(0);
            leaveBalanceRepository.save(balance);
        }

        return saved;
    }

    public void seedData() {
        try {
            run();
        } catch (Exception e) {
            log.error("Failed to seed demo data", e);
        }
    }
}
