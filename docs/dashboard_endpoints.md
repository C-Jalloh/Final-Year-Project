# Dashboard Endpoints Documentation

## Overview
The healthcare management system provides comprehensive dashboard endpoints that deliver role-specific data and statistics to support different user types (Admin, Doctor, Receptionist, Pharmacist, Nurse).

## Current Dashboard Endpoints

### 1. `/api/dashboard/` - Main Dashboard View
**Method:** GET  
**Authentication:** Required  
**Description:** Returns role-specific dashboard data including notifications, system health, and role-specific metrics.

#### Response Structure
```json
{
  "notifications": [
    {
      "id": "uuid",
      "message": "string",
      "created_at": "datetime",
      "is_read": boolean
    }
  ],
  "system_health": {
    "database": "ok"
  },
  "whats_new": [
    {
      "action": "string",
      "description": "string",
      "timestamp": "datetime"
    }
  ],
  "birthdays_today": [
    {
      "first_name": "string",
      "last_name": "string"
    }
  ],
  "anniversaries": [
    {
      "first_name": "string",
      "last_name": "string"
    }
  ],
  // Role-specific data below
}
```

#### Role-Specific Data

**Admin Role:**
- `total_patients`: Total patient count
- `active_users`: Count of active users
- `revenue_today`: Today's total revenue
- `patient_registrations_trend`: Patient registrations over last 7 days
- `revenue_trend`: Revenue trend over last 7 days
- `most_active_users`: Top 5 most active users
- `system_alerts`: Recent system alerts
- `revenue_breakdown`: Revenue by department
- `quick_links`: Admin action links

**Doctor Role:**
- `today_appointments`: Today's appointments
- `unread_lab_results`: Pending lab results
- `pending_tasks`: Assigned pending tasks
- `critical_lab_alerts`: Critical lab results
- `quick_links`: Doctor action links

**Receptionist Role:**
- `patient_queue`: Today's scheduled appointments
- `today_schedule`: Complete appointment schedule
- `pending_registrations`: New patient registrations today
- `missing_insurance`: Patients without insurance info
- `quick_actions`: Receptionist action links

**Pharmacist Role:**
- `low_stock_alerts`: Medications below reorder level
- `near_expiry_items`: Stock expiring within 30 days
- `pending_prescriptions`: Today's prescriptions
- `recent_purchase_orders`: Recent purchase orders
- `quick_links`: Pharmacy action links

### 2. `/api/dashboard-stats/` - Dashboard Statistics
**Method:** GET  
**Authentication:** Required  
**Description:** Returns basic system-wide statistics.

#### Response Structure
```json
{
  "total_patients": 150,
  "active_users": 25,
  "revenue_today": 2500.00
}
```

## Suggested Additional Dashboard Endpoints

### 1. `/api/dashboard/analytics/` - Advanced Analytics Dashboard
**Purpose:** Provide detailed analytics and KPIs for administrators and managers.

**Suggested Metrics:**
- Patient demographics (age groups, gender distribution)
- Appointment utilization rates
- Average wait times
- Treatment success rates
- Resource utilization (bed occupancy, equipment usage)
- Financial metrics (revenue by service, payment methods, outstanding bills)
- Quality metrics (patient satisfaction, readmission rates)

### 2. `/api/dashboard/clinical/` - Clinical Dashboard
**Purpose:** Support clinical decision-making and patient care monitoring.

**Suggested Features:**
- Patient vital signs trends
- Medication adherence tracking
- Lab result trends and alerts
- Chronic disease management metrics
- Infection control indicators
- Clinical pathway compliance

### 3. `/api/dashboard/operational/` - Operational Dashboard
**Purpose:** Monitor daily operations and resource management.

**Suggested Metrics:**
- Bed occupancy rates
- Staff scheduling and coverage
- Equipment maintenance schedules
- Supply chain status
- Emergency response times
- Patient flow metrics

### 4. `/api/dashboard/financial/` - Financial Dashboard
**Purpose:** Track financial performance and billing metrics.

**Suggested Features:**
- Revenue analysis by department/service
- Insurance claims status
- Outstanding payments aging
- Cost analysis by treatment type
- Budget vs actual spending
- Payment method distribution

### 5. `/api/dashboard/quality/` - Quality Assurance Dashboard
**Purpose:** Monitor healthcare quality indicators and compliance.

**Suggested Metrics:**
- Patient satisfaction scores
- Readmission rates
- Infection rates
- Medication error rates
- Compliance with clinical guidelines
- Wait time compliance
- Patient safety incidents

### 6. `/api/dashboard/patient/` - Patient Portal Dashboard
**Purpose:** Provide patients with access to their health information.

**Suggested Features:**
- Upcoming appointments
- Recent lab results
- Current medications
- Health summary
- Bill payment status
- Communication with providers

### 7. `/api/dashboard/staff/` - Staff Performance Dashboard
**Purpose:** Monitor staff productivity and performance metrics.

**Suggested Features:**
- Appointment completion rates
- Patient satisfaction by provider
- Task completion metrics
- Continuing education tracking
- Performance reviews
- Workload distribution

### 8. `/api/dashboard/research/` - Research Dashboard
**Purpose:** Support clinical research and data analysis.

**Suggested Features:**
- Study enrollment tracking
- Data collection progress
- Research metrics
- Publication tracking
- Grant management
- IRB compliance status

## Implementation Recommendations

### 1. **Caching Strategy**
- Implement Redis caching for dashboard data
- Cache expensive queries for 5-15 minutes
- Use cache invalidation on data changes

### 2. **Real-time Updates**
- Implement WebSocket connections for live updates
- Push notifications for critical alerts
- Real-time bed status updates

### 3. **Performance Optimization**
- Use database indexes on frequently queried fields
- Implement pagination for large datasets
- Use select_related and prefetch_related for complex queries

### 4. **Security Considerations**
- Ensure role-based data filtering
- Implement audit logging for dashboard access
- Rate limiting for API endpoints

### 5. **Mobile Responsiveness**
- Design dashboards for mobile access
- Implement progressive web app features
- Optimize data payloads for mobile networks

## API Response Standards

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "timestamp": "2025-09-21T10:00:00Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2025-09-21T10:00:00Z"
}
```

## Future Enhancements

1. **Customizable Dashboards:** Allow users to configure their dashboard layout
2. **Advanced Filtering:** Date range filters, department filters, etc.
3. **Export Capabilities:** PDF/Excel export of dashboard data
4. **Alert System:** Configurable alerts and notifications
5. **Historical Trends:** Long-term trend analysis and forecasting</content>
<parameter name="filePath">/home/c_jalloh/Documents/School/Second Semester/ITCA Week/code/docs/dashboard_endpoints.md
