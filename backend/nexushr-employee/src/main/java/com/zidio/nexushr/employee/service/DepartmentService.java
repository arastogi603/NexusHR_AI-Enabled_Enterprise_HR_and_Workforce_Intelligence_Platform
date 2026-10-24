package com.zidio.nexushr.employee.service;

import com.zidio.nexushr.common.exception.ResourceNotFoundException;
import com.zidio.nexushr.employee.dto.DepartmentDto;
import com.zidio.nexushr.employee.entity.Department;
import com.zidio.nexushr.employee.mapper.DepartmentMapper;
import com.zidio.nexushr.employee.repository.DepartmentRepository;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentMapper departmentMapper;

    public DepartmentService(DepartmentRepository departmentRepository,
                             EmployeeRepository employeeRepository,
                             DepartmentMapper departmentMapper) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.departmentMapper = departmentMapper;
    }

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(departmentMapper::toDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return departmentMapper.toDto(department);
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto request) {
        if (departmentRepository.findByName(request.getName()).isPresent()) {
            throw new com.zidio.nexushr.common.exception.DuplicateResourceException("Department with name '" + request.getName() + "' already exists");
        }

        Department department = new Department();
        department.setName(request.getName());
        department.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Department parent = departmentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent department not found"));
            department.setParent(parent);
        }

        if (request.getHeadId() != null) {
            var head = employeeRepository.findById(request.getHeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            department.setHead(head);
        }

        department = departmentRepository.save(department);
        return departmentMapper.toDto(department);
    }

    @Transactional
    public DepartmentDto updateDepartment(UUID id, DepartmentDto request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Department parent = departmentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent department not found"));
            department.setParent(parent);
        } else {
            department.setParent(null);
        }

        if (request.getHeadId() != null) {
            var head = employeeRepository.findById(request.getHeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            department.setHead(head);
        } else {
            department.setHead(null);
        }

        department = departmentRepository.save(department);
        return departmentMapper.toDto(department);
    }

    @Transactional
    public void deleteDepartment(UUID id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
        long employeeCount = employeeRepository.countByDepartmentId(id);
        if (employeeCount > 0) {
            throw new com.zidio.nexushr.common.exception.BusinessRuleException(
                    "Cannot delete department because " + employeeCount + " employee(s) are assigned to it. Please reassign them first.");
        }
        departmentRepository.deleteById(id);
    }
}
