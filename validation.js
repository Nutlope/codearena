class ModelSelectionValidator {
    constructor() {
        this.model1Select = document.getElementById('model1');
        this.model2Select = document.getElementById('model2');
        this.model1Error = document.getElementById('model1-error');
        this.model2Error = document.getElementById('model2-error');
        this.model1Icon = document.getElementById('model1-icon');
        this.model2Icon = document.getElementById('model2-icon');
        this.selectedModel1 = document.getElementById('selectedModel1');
        this.selectedModel2 = document.getElementById('selectedModel2');
        this.validationStatus = document.getElementById('validationStatus');
        this.submitBtn = document.getElementById('submitBtn');
        this.validateBtn = document.getElementById('validateBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.form = document.getElementById('modelForm');
        
        this.validationRules = {
            rule1: document.getElementById('rule1'),
            rule2: document.getElementById('rule2'),
            rule3: document.getElementById('rule3')
        };

        this.init();
    }

    init() {
        // Event listeners for real-time validation
        this.model1Select.addEventListener('change', () => this.validateInRealTime());
        this.model2Select.addEventListener('change', () => this.validateInRealTime());
        
        // Button event listeners
        this.validateBtn.addEventListener('click', () => this.validateSelection());
        this.resetBtn.addEventListener('click', () => this.resetSelection());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Initial state
        this.updateUI();
    }

    validateInRealTime() {
        this.clearErrors();
        this.updateSelectedModels();
        this.validateAndUpdateUI();
    }

    validateSelection() {
        this.clearErrors();
        const validation = this.performValidation();
        this.displayValidationResults(validation);
        this.updateUI();
        return validation;
    }

    performValidation() {
        const model1Value = this.model1Select.value.trim();
        const model2Value = this.model2Select.value.trim();
        
        const validation = {
            isValid: true,
            errors: {
                model1: [],
                model2: [],
                general: []
            },
            rules: {
                bothSelected: false,
                different: false,
                ready: false
            }
        };

        // Rule 1: Both models must be selected
        if (!model1Value) {
            validation.errors.model1.push('Model A is required');
            validation.isValid = false;
        }
        
        if (!model2Value) {
            validation.errors.model2.push('Model B is required');
            validation.isValid = false;
        }

        validation.rules.bothSelected = model1Value && model2Value;

        // Rule 2: Models must be different
        if (model1Value && model2Value && model1Value === model2Value) {
            validation.errors.general.push('Both models cannot be the same. Please select different models.');
            validation.isValid = false;
        }

        validation.rules.different = model1Value && model2Value && model1Value !== model2Value;

        // Rule 3: Overall validation
        validation.rules.ready = validation.rules.bothSelected && validation.rules.different;

        return validation;
    }

    displayValidationResults(validation) {
        // Display model-specific errors
        if (validation.errors.model1.length > 0) {
            this.model1Error.textContent = validation.errors.model1[0];
            this.setFieldState(this.model1Select, this.model1Icon, 'invalid');
        } else if (this.model1Select.value) {
            this.setFieldState(this.model1Select, this.model1Icon, 'valid');
        }

        if (validation.errors.model2.length > 0) {
            this.model2Error.textContent = validation.errors.model2[0];
            this.setFieldState(this.model2Select, this.model2Icon, 'invalid');
        } else if (this.model2Select.value) {
            this.setFieldState(this.model2Select, this.model2Icon, 'valid');
        }

        // Display general errors
        if (validation.errors.general.length > 0) {
            // If same model selected, mark both as invalid
            this.setFieldState(this.model1Select, this.model1Icon, 'invalid');
            this.setFieldState(this.model2Select, this.model2Icon, 'invalid');
            this.model1Error.textContent = validation.errors.general[0];
            this.model2Error.textContent = validation.errors.general[0];
        }

        // Update validation status
        this.updateValidationStatus(validation);
        this.updateValidationRules(validation.rules);
    }

    validateAndUpdateUI() {
        const validation = this.performValidation();
        this.displayValidationResults(validation);
        this.updateUI();
    }

    setFieldState(field, icon, state) {
        // Remove existing classes
        field.classList.remove('valid', 'invalid');
        icon.classList.remove('valid', 'invalid');
        
        // Add new state
        if (state) {
            field.classList.add(state);
            icon.classList.add(state);
        }
    }

    clearErrors() {
        this.model1Error.textContent = '';
        this.model2Error.textContent = '';
        this.setFieldState(this.model1Select, this.model1Icon, '');
        this.setFieldState(this.model2Select, this.model2Icon, '');
    }

    updateSelectedModels() {
        const model1Value = this.model1Select.value;
        const model2Value = this.model2Select.value;
        
        const model1Display = this.selectedModel1.querySelector('.model-value');
        const model2Display = this.selectedModel2.querySelector('.model-value');
        
        // Update Model A display
        if (model1Value) {
            model1Display.textContent = this.getModelDisplayName(model1Value);
            model1Display.classList.add('selected');
        } else {
            model1Display.textContent = 'Not selected';
            model1Display.classList.remove('selected');
        }
        
        // Update Model B display
        if (model2Value) {
            model2Display.textContent = this.getModelDisplayName(model2Value);
            model2Display.classList.add('selected');
        } else {
            model2Display.textContent = 'Not selected';
            model2Display.classList.remove('selected');
        }
    }

    getModelDisplayName(value) {
        const option = this.model1Select.querySelector(`option[value="${value}"]`) || 
                     this.model2Select.querySelector(`option[value="${value}"]`);
        return option ? option.textContent : value;
    }

    updateValidationStatus(validation) {
        const statusElement = this.validationStatus;
        const statusText = statusElement.querySelector('.status-text');
        
        // Remove existing classes
        statusElement.classList.remove('valid', 'invalid', 'pending');
        
        if (validation.isValid) {
            statusElement.classList.add('valid');
            statusText.textContent = '✓ Valid selection - Ready to compare models!';
        } else if (this.model1Select.value || this.model2Select.value) {
            statusElement.classList.add('invalid');
            if (validation.errors.general.length > 0) {
                statusText.textContent = validation.errors.general[0];
            } else {
                statusText.textContent = '✗ Please complete the selection';
            }
        } else {
            statusElement.classList.add('pending');
            statusText.textContent = 'Please select two different models';
        }
    }

    updateValidationRules(rules) {
        // Update rule 1: Both selected
        const rule1 = this.validationRules.rule1;
        rule1.classList.remove('valid', 'invalid', 'pending');
        if (rules.bothSelected) {
            rule1.classList.add('valid');
        } else if (this.model1Select.value || this.model2Select.value) {
            rule1.classList.add('invalid');
        } else {
            rule1.classList.add('pending');
        }

        // Update rule 2: Different models
        const rule2 = this.validationRules.rule2;
        rule2.classList.remove('valid', 'invalid', 'pending');
        if (rules.different) {
            rule2.classList.add('valid');
        } else if (rules.bothSelected && !rules.different) {
            rule2.classList.add('invalid');
        } else {
            rule2.classList.add('pending');
        }

        // Update rule 3: Ready
        const rule3 = this.validationRules.rule3;
        rule3.classList.remove('valid', 'invalid', 'pending');
        if (rules.ready) {
            rule3.classList.add('valid');
        } else if (this.model1Select.value || this.model2Select.value) {
            rule3.classList.add('invalid');
        } else {
            rule3.classList.add('pending');
        }
    }

    updateUI() {
        const validation = this.performValidation();
        this.submitBtn.disabled = !validation.isValid;
        
        if (validation.isValid) {
            this.submitBtn.classList.add('btn-primary');
            this.submitBtn.classList.remove('btn-secondary');
        } else {
            this.submitBtn.classList.remove('btn-primary');
            this.submitBtn.classList.add('btn-secondary');
        }
    }

    resetSelection() {
        // Reset form fields
        this.model1Select.value = '';
        this.model2Select.value = '';
        
        // Clear all states and errors
        this.clearErrors();
        this.updateSelectedModels();
        
        // Reset validation status
        this.validationStatus.classList.remove('valid', 'invalid');
        this.validationStatus.classList.add('pending');
        this.validationStatus.querySelector('.status-text').textContent = 'Please select two different models';
        
        // Reset validation rules
        Object.values(this.validationRules).forEach(rule => {
            rule.classList.remove('valid', 'invalid');
            rule.classList.add('pending');
        });
        
        // Update UI
        this.updateUI();
        
        // Add visual feedback
        this.form.classList.add('shake');
        setTimeout(() => {
            this.form.classList.remove('shake');
        }, 500);
    }

    handleSubmit(event) {
        event.preventDefault();
        
        const validation = this.validateSelection();
        
        if (validation.isValid) {
            const model1Value = this.model1Select.value;
            const model2Value = this.model2Select.value;
            const model1Name = this.getModelDisplayName(model1Value);
            const model2Name = this.getModelDisplayName(model2Value);
            
            // Simulate successful submission
            alert(`Success! Comparing models:\n\n` +
                  `Model A: ${model1Name}\n` +
                  `Model B: ${model2Name}\n\n` +
                  `This would typically redirect to a comparison page or start the comparison process.`);
            
            console.log('Form submitted with models:', {
                model1: { value: model1Value, name: model1Name },
                model2: { value: model2Value, name: model2Name }
            });
        } else {
            // Show validation errors with animation
            this.form.classList.add('shake');
            setTimeout(() => {
                this.form.classList.remove('shake');
            }, 500);
        }
    }
}

// Initialize the validator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const validator = new ModelSelectionValidator();
    
    // Make it available globally for debugging
    window.modelValidator = validator;
    
    console.log('Model Selection Validator initialized');
    console.log('Available for debugging as window.modelValidator');
});
