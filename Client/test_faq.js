/**
 * Automated Test Suite for Dental Clinic Rule-Based FAQ & Intent Detection Engine
 * Tests all 20+ requirements, intent detection, context resolution, fallback variation,
 * safety triage, and booking flow triggers.
 */

import assert from 'assert';
import {
  normalizeMessage,
  detectIntent,
  handlePatientMessage,
  getInitialConversationState,
  getClinicOpenStatus,
} from './src/utils/dentalFaq.js';
import { CLINIC_INFO } from './src/components/AIReceptionist/data/receptionistData.js';

console.log('=== RUNNING DENTAL CLINIC RULE-BASED FAQ TEST SUITE ===\n');

// 1. Basic FAQs
console.log('--- TEST 1: Greeting ("Hi") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('Hi', state);
  console.log('Output:', res.message);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.type, 'text');
  assert.ok(
    res.message.includes('Welcome to Dental Clinic') ||
    res.message.includes('virtual receptionist') ||
    res.message.includes('welcome')
  );
  assert.ok(!res.message.toLowerCase().includes('sorry'));
  console.log('✓ PASS\n');
}

console.log('--- TEST 2: Verified Clinic Location ("Where is your clinic located?") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('Where is your clinic located?', state);
  console.log('Output:', res.message);
  assert.ok(res.message.includes(CLINIC_INFO.address));
  assert.ok(res.message.includes('Coimbatore'));
  assert.ok(res.message.includes('valet parking') || res.message.includes('parking'));
  assert.strictEqual(res.type, 'clinic_contact');
  console.log('✓ PASS\n');
}

console.log('--- TEST 3: Operating Hours ("What time do you open?") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('What time do you open?', state);
  console.log('Output:', res.message);
  assert.ok(res.message.includes('8:00 AM'));
  assert.ok(res.message.includes('6:00 PM'));
  assert.ok(res.message.includes('Mon - Fri') || res.message.includes('Monday through Friday'));
  assert.ok(res.message.includes(CLINIC_INFO.emergencyPhone));
  console.log('✓ PASS\n');
}

console.log('--- TEST 4: Verified Service Inquiry ("Do you provide braces?") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('Do you provide braces?', state);
  console.log('Output:', res.message);
  assert.ok(res.message.includes('Invisalign') || res.message.includes('aligners') || res.message.includes('braces'));
  assert.ok(res.message.includes('3D'));
  assert.strictEqual(state.lastTreatment, 'braces');
  console.log('✓ PASS\n');
}

console.log('--- TEST 5: Treatment Cost ("How much do dental implants cost?") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('How much do dental implants cost?', state);
  console.log('Output:', res.message);
  assert.ok(res.message.includes('implant') || res.message.includes('Implant'));
  assert.ok(res.message.includes('itemized') || res.message.includes('diagnostic') || res.message.includes('plan'));
  assert.strictEqual(state.lastTreatment, 'implants');
  console.log('✓ PASS\n');
}

console.log('--- TEST 6: Payment Methods ("Do you accept UPI?") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('Do you accept UPI?', state);
  console.log('Output:', res.message);
  assert.ok(res.message.includes('UPI'));
  assert.ok(res.message.includes('Google Pay') || res.message.includes('Credit') || res.message.includes('Cash'));
  console.log('✓ PASS\n');
}

console.log('--- TEST 7: Pain-Free Tech / Educational ("Is a root canal painful?") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('Is a root canal painful?', state);
  console.log('Output:', res.message);
  assert.ok(res.message.includes('microscopic') || res.message.includes('anesthesia') || res.message.includes('pain-free') || res.message.includes('save'));
  assert.ok(!res.message.toLowerCase().includes('sorry'));
  console.log('✓ PASS\n');
}

// 2. Context-Aware Follow-ups
console.log('--- TEST 8: Context resolution ("Do you provide braces?" -> "How much?") ---');
{
  const state = getInitialConversationState();
  const turn1 = handlePatientMessage('Do you provide braces?', state);
  assert.strictEqual(state.lastTreatment, 'braces');
  
  const turn2 = handlePatientMessage('How much?', state);
  console.log('Turn 2 Output:', turn2.message);
  assert.ok(turn2.message.toLowerCase().includes('orthodontic') || turn2.message.toLowerCase().includes('braces') || turn2.message.toLowerCase().includes('aligners'));
  assert.ok(turn2.message.includes('itemized') || turn2.message.includes('EMI') || turn2.message.includes('scan'));
  console.log('✓ PASS\n');
}

console.log('--- TEST 9: Multi-turn Context ("How much?" -> "Is it painful?") ---');
{
  const state = getInitialConversationState();
  handlePatientMessage('Do you provide braces?', state);
  handlePatientMessage('How much?', state);
  
  const turn3 = handlePatientMessage('Is it painful?', state);
  console.log('Turn 3 Output:', turn3.message);
  assert.ok(turn3.message.toLowerCase().includes('braces') || turn3.message.toLowerCase().includes('aligners'));
  assert.ok(turn3.message.toLowerCase().includes('pressure') || turn3.message.toLowerCase().includes('soreness') || turn3.message.toLowerCase().includes('mild'));
  console.log('✓ PASS\n');
}

console.log('--- TEST 10: Topic Switch (from dental treatment to clinic hours) ---');
{
  const state = getInitialConversationState();
  handlePatientMessage('Do you provide braces?', state);
  assert.strictEqual(state.lastTreatment, 'braces');

  const turnHours = handlePatientMessage('What are your opening hours?', state);
  console.log('Turn Hours Output:', turnHours.message);
  assert.ok(turnHours.message.includes('8:00 AM'));
  assert.ok(turnHours.message.includes('6:00 PM'));
  assert.strictEqual(turnHours.type, 'clinic_hours');
  assert.strictEqual(state.lastCategory, 'clinic');
  console.log('✓ PASS\n');
}

// 3. Booking Intent vs Informational
console.log('--- TEST 11: Informational booking inquiry ("How do I book an appointment?") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('How do I book an appointment?', state);
  console.log('Output:', res.message);
  assert.strictEqual(res.type, 'text', 'Must be informational text, not appointment_flow');
  assert.ok(res.message.includes('online booking form') || res.message.includes('provisional') || res.message.includes('chat'));
  assert.ok(!res.message.toLowerCase().includes('sorry'));
  console.log('✓ PASS\n');
}

console.log('--- TEST 12: Explicit booking request ("I want to book an appointment.") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('I want to book an appointment.', state);
  console.log('Output:', res.message);
  assert.strictEqual(res.type, 'appointment_flow');
  assert.strictEqual(state.isBookingActive, true);
  console.log('✓ PASS\n');
}

console.log('--- TEST 13: Booking with treatment preselection ("I want to book a root canal appointment.") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('I want to book a root canal appointment.', state);
  console.log('Output:', res.message);
  assert.strictEqual(res.type, 'appointment_flow');
  assert.strictEqual(res.initialService, 'Microscopic Root Canal Therapy');
  assert.strictEqual(state.isBookingActive, true);
  console.log('✓ PASS\n');
}

console.log('--- TEST 14: FAQ text during active booking does not break booking ---');
{
  const state = getInitialConversationState();
  // Start booking
  handlePatientMessage('I want to book an appointment.', state);
  assert.strictEqual(state.isBookingActive, true);

  // User asks a side question while booking
  const res = handlePatientMessage('Do you have parking?', state);
  console.log('Output:', res.message);
  assert.ok(res.message.includes('valet parking'));
  assert.ok(res.message.includes('appointment request form above remains available'));
  assert.strictEqual(state.isBookingActive, true);
  console.log('✓ PASS\n');
}

// 4. Fallback Variation & No Repetitive Apologies
console.log('--- TEST 15: 5 Consecutive Unknown Dental Questions (Rotation & Non-repetition) ---');
{
  const state = getInitialConversationState();
  const dentalQueries = [
    'Can adult teeth grow twice?',
    'Does deep sea diving harm dental pulp?',
    'Can teeth absorb titanium minerals?',
    'What dental effects does mountain climbing have?',
    'Can saliva dissolve crystal minerals?',
  ];

  const responses = [];
  for (const q of dentalQueries) {
    const res = handlePatientMessage(q, state);
    console.log(`Query "${q}" -> ${res.message}`);
    assert.ok(!res.message.toLowerCase().startsWith('sorry'));
    assert.ok(!res.message.toLowerCase().includes('sorry, i don\'t understand'));
    responses.push(res.message);
  }

  // Ensure consecutive responses are never identical
  for (let i = 1; i < responses.length; i++) {
    assert.notStrictEqual(responses[i], responses[i - 1], `Consecutive responses ${i-1} and ${i} must differ`);
  }
  console.log('✓ PASS: All 5 consecutive dental fallbacks were distinct and constructive\n');
}

console.log('--- TEST 16: 5 Consecutive Unknown Clinic Questions (Rotation & Non-repetition) ---');
{
  const state = getInitialConversationState();
  const clinicQueries = [
    'What color is the clinic front door?',
    'How many floor tiles are inside the clinic?',
    'Who was the architect of the clinic building?',
    'What brand of chairs are in the clinic waiting area?',
    'Is the clinic near an electric vehicle charging station?',
  ];

  const responses = [];
  for (const q of clinicQueries) {
    const res = handlePatientMessage(q, state);
    console.log(`Query "${q}" -> ${res.message}`);
    assert.ok(!res.message.toLowerCase().startsWith('sorry'));
    responses.push(res.message);
  }

  for (let i = 1; i < responses.length; i++) {
    assert.notStrictEqual(responses[i], responses[i - 1], `Consecutive responses ${i-1} and ${i} must differ`);
  }
  console.log('✓ PASS: All 5 consecutive clinic fallbacks were distinct\n');
}

console.log('--- TEST 17: Consecutive Unrelated Questions (Helpful & Varied) ---');
{
  const state = getInitialConversationState();
  const unrelatedQueries = [
    'What is the capital of Iceland?',
    'Can you write a poem about quantum physics?',
    'How tall is Mount Everest?',
    'What is the stock price of Apple?',
    'Who won the 1994 football world cup?',
  ];

  const responses = [];
  for (const q of unrelatedQueries) {
    const res = handlePatientMessage(q, state);
    console.log(`Query "${q}" -> ${res.message}`);
    assert.ok(!res.message.toLowerCase().startsWith('sorry'));
    responses.push(res.message);
  }

  for (let i = 1; i < responses.length; i++) {
    assert.notStrictEqual(responses[i], responses[i - 1], `Consecutive responses ${i-1} and ${i} must differ`);
  }
  console.log('✓ PASS: All unrelated fallbacks were polite, non-apologetic, and varied\n');
}

// 5. Safety & Urgent Guidance
console.log('--- TEST 18: Dental Symptom ("My face is swollen.") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('My face is swollen.', state);
  console.log('Output:', res.message);
  assert.ok(res.message.includes('Facial swelling') || res.message.includes('cold compress'));
  assert.ok(res.message.includes('prompt clinical assessment') || res.message.includes('priority'));
  assert.ok(res.message.includes(CLINIC_INFO.phone) || res.message.includes(CLINIC_INFO.emergencyPhone));
  console.log('✓ PASS\n');
}

console.log('--- TEST 19: Critical Emergency ("I can\'t breathe because my face is swelling.") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage("I can't breathe because my face is swelling.", state);
  console.log('Output:', res.message);
  assert.ok(res.message.includes('EMERGENCY'));
  assert.ok(res.message.includes('hospital emergency room') || res.message.includes('ER'));
  assert.ok(res.message.includes('immediate emergency medical care'));
  console.log('✓ PASS\n');
}

console.log('--- TEST 20: Multi-question ("Where are you located and what time do you open?") ---');
{
  const state = getInitialConversationState();
  const res = handlePatientMessage('Where are you located and what time do you open?', state);
  console.log('Output:', res.message);
  assert.ok(res.message.includes('12/A, Nava India, Coimbatore'));
  assert.ok(res.message.includes('8:00 AM'));
  assert.ok(res.message.includes('6:00 PM'));
  console.log('✓ PASS\n');
}

console.log('--- TEST 21: Real-time Operating Status ---');
{
  const status = getClinicOpenStatus();
  console.log('Status result:', status);
  assert.ok(typeof status.isOpen === 'boolean');
  assert.ok(typeof status.day === 'number');
  console.log('✓ PASS\n');
}

console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
