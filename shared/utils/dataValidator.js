/**
 * Data Validation Utility
 * Provides schema validation for all data types in TrackMind
 */

/**
 * Validate a value against a schema
 * @param {any} value - Value to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
const validate = (value, schema) => {
    const errors = [];

    // Type validation
    if (schema.type && typeof value !== schema.type) {
        errors.push(`Expected type ${schema.type}, got ${typeof value}`);
        return { valid: false, errors };
    }

    // Required validation
    if (schema.required && (value === null || value === undefined || value === '')) {
        errors.push('This field is required');
        return { valid: false, errors };
    }

    // String validations
    if (schema.type === 'string' && value) {
        if (schema.minLength && value.length < schema.minLength) {
            errors.push(`Minimum length is ${schema.minLength}`);
        }
        if (schema.maxLength && value.length > schema.maxLength) {
            errors.push(`Maximum length is ${schema.maxLength}`);
        }
        if (schema.pattern && !schema.pattern.test(value)) {
            errors.push('Invalid format');
        }
    }

    // Number validations
    if (schema.type === 'number' && value !== null && value !== undefined) {
        if (schema.min !== undefined && value < schema.min) {
            errors.push(`Minimum value is ${schema.min}`);
        }
        if (schema.max !== undefined && value > schema.max) {
            errors.push(`Maximum value is ${schema.max}`);
        }
    }

    // Array validations
    if (schema.type === 'array' && Array.isArray(value)) {
        if (schema.minItems && value.length < schema.minItems) {
            errors.push(`Minimum ${schema.minItems} items required`);
        }
        if (schema.maxItems && value.length > schema.maxItems) {
            errors.push(`Maximum ${schema.maxItems} items allowed`);
        }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validate an object against a schema with nested fields
 */
const validateObject = (obj, schema) => {
    const allErrors = {};
    let isValid = true;

    for (const [field, fieldSchema] of Object.entries(schema)) {
        const { valid, errors } = validate(obj[field], fieldSchema);
        if (!valid) {
            allErrors[field] = errors;
            isValid = false;
        }
    }

    return { valid: isValid, errors: allErrors };
};

// ============================================
// SCHEMA DEFINITIONS
// ============================================

export const TaskSchema = {
    id: { type: 'string', required: true },
    title: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    notes: { type: 'string', maxLength: 500 },
    priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
    dueDate: { type: 'string' }, // ISO date string
    completed: { type: 'boolean', required: true },
    tags: { type: 'array' },
    recurrence: { type: 'string', enum: ['None', 'Daily', 'Weekly', 'Monthly'] },
    createdAt: { type: 'string', required: true },
    updatedAt: { type: 'string', required: true }
};

export const HabitSchema = {
    id: { type: 'string', required: true },
    title: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    icon: { type: 'string' },
    frequency: { type: 'string', required: true, enum: ['Daily', 'Weekly', 'Custom'] },
    streak: { type: 'number', required: true, min: 0 },
    history: { type: 'object', required: true }, // { date: { completed: bool, value: number } }
    reminder: { type: 'string' }, // ISO time string
    goal: { type: 'string', maxLength: 200 }
};

export const SkillSchema = {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    category: { type: 'string', required: true },
    level: { type: 'number', required: true, min: 0, max: 100 },
    targetLevel: { type: 'number', min: 0, max: 100 },
    timeSpent: { type: 'number', required: true, min: 0 },
    logs: { type: 'array', required: true },
    description: { type: 'string', maxLength: 300 },
    color: { type: 'string' },
    icon: { type: 'string' }
};

export const PlannerBlockSchema = {
    id: { type: 'string', required: true },
    title: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    type: { type: 'string', required: true, enum: ['task', 'habit', 'skill'] },
    date: { type: 'string', required: true }, // YYYY-MM-DD
    startTime: { type: 'string', required: true }, // ISO string
    endTime: { type: 'string', required: true }, // ISO string
    category: { type: 'string', enum: ['Study', 'Work', 'Skill', 'Health', 'Break', 'Personal'] },
    color: { type: 'string' },
    linkedTaskId: { type: 'string' },
    linkedHabitId: { type: 'string' },
    linkedSkillId: { type: 'string' },
    repeat: { type: 'string' }, // or object for complex repeats
    reminderMinutes: { type: 'number', min: 0 },
    notes: { type: 'string', maxLength: 500 },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string', required: true }
};

export const JournalEntrySchema = {
    id: { type: 'string', required: true },
    date: { type: 'string', required: true }, // ISO string
    text: { type: 'string', required: true, minLength: 1, maxLength: 5000 },
    mood: { type: 'string', enum: ['happy', 'sad', 'neutral', 'excited', 'anxious'] }
};

export const SettingsSchema = {
    theme: { type: 'string', required: true, enum: ['dark', 'light'] },
    notificationsEnabled: { type: 'boolean', required: true },
    weekStartDay: { type: 'string', required: true, enum: ['Monday', 'Sunday'] },
    cloudBackup: { type: 'boolean', required: true },
    appLock: { type: 'boolean', required: true }
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export const validateTask = (task) => validateObject(task, TaskSchema);
export const validateHabit = (habit) => validateObject(habit, HabitSchema);
export const validateSkill = (skill) => validateObject(skill, SkillSchema);
export const validatePlannerBlock = (block) => validateObject(block, PlannerBlockSchema);
export const validateJournalEntry = (entry) => validateObject(entry, JournalEntrySchema);
export const validateSettings = (settings) => validateObject(settings, SettingsSchema);

/**
 * Validate an array of items
 */
export const validateArray = (items, validator) => {
    const results = items.map((item, index) => ({
        index,
        ...validator(item)
    }));

    const invalidItems = results.filter(r => !r.valid);

    return {
        valid: invalidItems.length === 0,
        errors: invalidItems,
        validCount: results.length - invalidItems.length,
        invalidCount: invalidItems.length
    };
};

/**
 * Sanitize data by removing invalid fields
 */
export const sanitizeData = (data, schema) => {
    const sanitized = {};
    const allowedFields = Object.keys(schema);

    for (const field of allowedFields) {
        if (data.hasOwnProperty(field)) {
            sanitized[field] = data[field];
        }
    }

    return sanitized;
};

/**
 * Apply default values from schema
 */
export const applyDefaults = (data, defaults) => {
    return { ...defaults, ...data };
};

export default {
    validate,
    validateObject,
    validateTask,
    validateHabit,
    validateSkill,
    validatePlannerBlock,
    validateJournalEntry,
    validateSettings,
    validateArray,
    sanitizeData,
    applyDefaults
};
