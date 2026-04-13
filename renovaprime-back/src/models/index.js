const Role = require('./Role');
const User = require('./User');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Specialty = require('./Specialty');
const DoctorSpecialty = require('./DoctorSpecialty');
const DoctorSchedule = require('./DoctorSchedule');
const DoctorScheduleBlock = require('./DoctorScheduleBlock');
const Appointment = require('./Appointment');
const TeleconsultRoom = require('./TeleconsultRoom');
const Prescription = require('./Prescription');
const AppointmentLog = require('./AppointmentLog');
const Beneficiary = require('./Beneficiary');
const Partner = require('./Partner');
const PartnerBranch = require('./PartnerBranch');
const Reseller = require('./Reseller');
const PasswordResetToken = require('./PasswordResetToken');
const Cms = require('./Cms');
const PlanCommission = require('./PlanCommission');
const ResellerSale = require('./ResellerSale');
const PaymentWebhookEvent = require('./PaymentWebhookEvent');
const MedicalRecord = require('./MedicalRecord');
const RecordAttachment = require('./RecordAttachment');
const RecordAuditLog = require('./RecordAuditLog');
const Consent = require('./Consent');

Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

User.hasOne(Doctor, { foreignKey: 'user_id' });
Doctor.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Patient, { foreignKey: 'user_id' });
Patient.belongsTo(User, { foreignKey: 'user_id' });

Doctor.belongsToMany(Specialty, { through: DoctorSpecialty, foreignKey: 'doctor_id' });
Specialty.belongsToMany(Doctor, { through: DoctorSpecialty, foreignKey: 'specialty_id' });

Doctor.hasMany(DoctorSchedule, { foreignKey: 'doctor_id' });
DoctorSchedule.belongsTo(Doctor, { foreignKey: 'doctor_id' });

Doctor.hasMany(DoctorScheduleBlock, { foreignKey: 'doctor_id' });
DoctorScheduleBlock.belongsTo(Doctor, { foreignKey: 'doctor_id' });

Doctor.hasMany(Appointment, { foreignKey: 'doctor_id' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id' });

Patient.hasMany(Appointment, { foreignKey: 'patient_id' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });

Specialty.hasMany(Appointment, { foreignKey: 'specialty_id' });
Appointment.belongsTo(Specialty, { foreignKey: 'specialty_id' });

Appointment.hasOne(TeleconsultRoom, { foreignKey: 'appointment_id' });
TeleconsultRoom.belongsTo(Appointment, { foreignKey: 'appointment_id' });

Appointment.hasOne(Prescription, { foreignKey: 'appointment_id' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointment_id' });

Appointment.hasMany(AppointmentLog, { foreignKey: 'appointment_id' });
AppointmentLog.belongsTo(Appointment, { foreignKey: 'appointment_id' });

User.hasMany(AppointmentLog, { foreignKey: 'performed_by' });
AppointmentLog.belongsTo(User, { foreignKey: 'performed_by', as: 'performer' });

// Beneficiary self-reference (titular -> dependentes)
Beneficiary.belongsTo(Beneficiary, { as: 'titular', foreignKey: 'titular_id' });
Beneficiary.hasMany(Beneficiary, { as: 'dependents', foreignKey: 'titular_id' });

// Appointment -> Beneficiary relationship
Beneficiary.hasMany(Appointment, { foreignKey: 'beneficiary_id' });
Appointment.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id' });

// Beneficiary creator relationship
User.hasMany(Beneficiary, { foreignKey: 'created_by' });
Beneficiary.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Partner relationships
Partner.hasMany(PartnerBranch, { foreignKey: 'partner_id', as: 'branches' });
PartnerBranch.belongsTo(Partner, { foreignKey: 'partner_id' });

PartnerBranch.hasMany(Reseller, { foreignKey: 'branch_id', as: 'resellers' });
Reseller.belongsTo(PartnerBranch, { foreignKey: 'branch_id' });

// Password reset tokens
User.hasMany(PasswordResetToken, { foreignKey: 'user_id' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id' });

// Plan commissions
Partner.hasMany(PlanCommission, { foreignKey: 'partner_id', as: 'commissions' });
PlanCommission.belongsTo(Partner, { foreignKey: 'partner_id' });

// Reseller sales
Reseller.hasMany(ResellerSale, { foreignKey: 'reseller_id', as: 'sales' });
ResellerSale.belongsTo(Reseller, { foreignKey: 'reseller_id' });

PartnerBranch.hasMany(ResellerSale, { foreignKey: 'branch_id' });
ResellerSale.belongsTo(PartnerBranch, { foreignKey: 'branch_id' });

Partner.hasMany(ResellerSale, { foreignKey: 'partner_id' });
ResellerSale.belongsTo(Partner, { foreignKey: 'partner_id' });

Beneficiary.hasMany(ResellerSale, { foreignKey: 'beneficiary_id' });
ResellerSale.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id' });

// Webhook events
ResellerSale.hasMany(PaymentWebhookEvent, { foreignKey: 'sale_id', as: 'webhookEvents' });
PaymentWebhookEvent.belongsTo(ResellerSale, { foreignKey: 'sale_id' });

// Medical Records (Prontuário)
Appointment.hasOne(MedicalRecord, { foreignKey: 'appointment_id' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointment_id' });

Beneficiary.hasMany(MedicalRecord, { foreignKey: 'beneficiary_id' });
MedicalRecord.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id' });

Doctor.hasMany(MedicalRecord, { foreignKey: 'doctor_id' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctor_id' });

MedicalRecord.hasMany(RecordAttachment, { foreignKey: 'medical_record_id', as: 'attachments' });
RecordAttachment.belongsTo(MedicalRecord, { foreignKey: 'medical_record_id' });

User.hasMany(RecordAttachment, { foreignKey: 'uploaded_by', as: 'uploadedAttachments' });
RecordAttachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

MedicalRecord.hasMany(RecordAuditLog, { foreignKey: 'medical_record_id', as: 'auditLogs' });
RecordAuditLog.belongsTo(MedicalRecord, { foreignKey: 'medical_record_id' });

User.hasMany(RecordAuditLog, { foreignKey: 'actor_id', as: 'recordAuditActions' });
RecordAuditLog.belongsTo(User, { foreignKey: 'actor_id', as: 'actor' });

// Consents
Beneficiary.hasMany(Consent, { foreignKey: 'beneficiary_id' });
Consent.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id' });

Appointment.hasOne(Consent, { foreignKey: 'appointment_id' });
Consent.belongsTo(Appointment, { foreignKey: 'appointment_id' });

module.exports = {
  Role,
  User,
  Doctor,
  Patient,
  Specialty,
  DoctorSpecialty,
  DoctorSchedule,
  DoctorScheduleBlock,
  Appointment,
  TeleconsultRoom,
  Prescription,
  AppointmentLog,
  Beneficiary,
  Partner,
  PartnerBranch,
  Reseller,
  PasswordResetToken,
  Cms,
  PlanCommission,
  ResellerSale,
  PaymentWebhookEvent,
  MedicalRecord,
  RecordAttachment,
  RecordAuditLog,
  Consent
};
