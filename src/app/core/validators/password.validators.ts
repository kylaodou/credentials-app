import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value ?? '';
    const errors: ValidationErrors = {};
    if (v.length < 8)           errors['minLength'] = true;
    if (!/[A-Z]/.test(v))       errors['noUpper']   = true;
    if (!/[0-9]/.test(v))       errors['noNumber']  = true;
    if (!/[@$!%*?&#+]/.test(v)) errors['noSpecial'] = true;
    return Object.keys(errors).length ? errors : null;
  };
}

export function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const pw      = control.get('password')?.value;
  const confirm = control.get('password_confirmation')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}
