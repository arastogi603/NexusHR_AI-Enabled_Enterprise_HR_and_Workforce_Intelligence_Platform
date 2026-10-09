package com.zidio.nexushr.employee.service;

import com.zidio.nexushr.common.exception.ResourceNotFoundException;
import com.zidio.nexushr.employee.dto.EmployeeDto;
import com.zidio.nexushr.employee.dto.EmployeeRequest;
import com.zidio.nexushr.employee.entity.Department;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.mapper.EmployeeMapper;
import com.zidio.nexushr.employee.repository.DepartmentRepository;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.Random;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeMapper employeeMapper;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.employeeMapper = employeeMapper;
    }

    public Page<EmployeeDto> getAllEmployees(UUID departmentId, String status, Pageable pageable) {
        Page<Employee> employees;
        
        if (departmentId != null && status != null) {
            employees = employeeRepository.findByDepartmentIdAndStatus(departmentId, status, pageable);
        } else if (status != null) {
            employees = employeeRepository.findByStatus(status, pageable);
        } else {
            employees = employeeRepository.findAll(pageable);
        }
        
        return employees.map(employeeMapper::toDto);
    }

    public EmployeeDto getEmployeeById(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return employeeMapper.toDto(employee);
    }

    @Transactional
    public EmployeeDto createEmployee(EmployeeRequest request) {
        if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Employee employee = new Employee();
        
        // Simulating the creation of a User or linking to an existing one for the demo
        // In real app, we'd call Auth module to create the user first.
        employee.setUserId(UUID.randomUUID()); 
        
        // Generate a unique employee code
        employee.setEmployeeCode("EMP-" + (1000 + new Random().nextInt(9000)));
        
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setHireDate(request.getHireDate());
        employee.setSalary(request.getSalary());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            employee.setDepartment(dept);
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            employee.setManager(manager);
        }

        employee = employeeRepository.save(employee);
        return employeeMapper.toDto(employee);
    }

    @Transactional
    public EmployeeDto updateEmployee(UUID id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            employee.setDepartment(dept);
        } else {
            employee.setDepartment(null);
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            employee.setManager(manager);
        } else {
            employee.setManager(null);
        }

        employee = employeeRepository.save(employee);
        return employeeMapper.toDto(employee);
    }

    @Transactional
    public void deleteEmployee(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        // Soft delete
        employee.setStatus("INACTIVE");
        employee.setDeletedAt(java.time.LocalDateTime.now());
        employeeRepository.save(employee);
    }
}
