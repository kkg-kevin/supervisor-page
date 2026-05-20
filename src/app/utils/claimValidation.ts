import { Claim } from '../types';

export function isClaimValid(claim: Claim): boolean {
  if (claim.paymentType === 'Full') {
    return claim.progress === 100;
  }
  if (claim.paymentType === 'Advance') {
    return claim.progress >= 30;
  }
  return false;
}

export function getValidationMessage(claim: Claim): string {
  if (claim.paymentType === 'Full' && claim.progress < 100) {
    return 'Full payment requires 100% progress';
  }
  if (claim.paymentType === 'Advance' && claim.progress < 30) {
    return 'Advance payment requires at least 30% progress';
  }
  return '';
}

export function getEligibilityStatus(claim: Claim): 'Eligible' | 'Not Eligible' {
  return isClaimValid(claim) ? 'Eligible' : 'Not Eligible';
}
