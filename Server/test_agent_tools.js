import assert from 'assert';
import { toolRegistry } from './toolRegistry.js';
import { generateAIResponse } from './aiService.js';
import { resolveRelativeDate } from './tools/dateResolver.js';

async function runTests() {
  console.log('=== RUNNING AI AGENT & TOOL CALLING TEST SUITE ===\n');

  // Test 1: Tool Registry Registration & Direct Execution
  console.log('--- TEST 1: Tool Registry check_availability direct invocation ---');
  const directAvail = await toolRegistry.execute('check_availability', {
    doctor: 'Dr. Arun',
    date: '2026-10-08',
    time: '5:00 PM',
  });
  console.log('Direct Available Result:', directAvail);
  assert.strictEqual(directAvail.available, true);
  assert.strictEqual(directAvail.doctor, 'Dr. Arun Kumar');
  assert.strictEqual(directAvail.time, '5:00 PM');
  console.log('✓ PASS: Direct tool execution succeeded for available slot\n');

  // Test 2: Direct Execution - Unavailable slot
  console.log('--- TEST 2: Direct Execution - Booked slot ---');
  const directBooked = await toolRegistry.execute('check_availability', {
    doctor: 'Dr. Arun Kumar',
    date: '2026-10-08',
    time: '10:30 AM',
  });
  console.log('Direct Booked Result:', directBooked);
  assert.strictEqual(directBooked.available, false);
  assert.ok(directBooked.message.includes('already fully booked'));
  console.log('✓ PASS: Direct tool execution detected booked slot\n');

  // Test 3: Direct Execution - Unknown doctor
  console.log('--- TEST 3: Direct Execution - Unknown doctor ---');
  const directUnknown = await toolRegistry.execute('check_availability', {
    doctor: 'Dr. Strange',
    date: '2026-10-08',
    time: '5:00 PM',
  });
  console.log('Direct Unknown Doctor Result:', directUnknown);
  assert.strictEqual(directUnknown.available, false);
  assert.strictEqual(directUnknown.error, 'UNKNOWN_DOCTOR');
  console.log('✓ PASS: Direct tool execution rejected unknown doctor\n');

  // Test 4: End-to-End Agent - "Can I see Dr. Arun tomorrow at 5 PM?"
  console.log('--- TEST 4: Agent Flow - Available slot request ---');
  const agent1 = await generateAIResponse('Can I see Dr. Arun tomorrow at 5 PM?');
  console.log('Agent 1 Output:', agent1);
  assert.ok(agent1.toolCall, 'Agent must have called a tool');
  assert.strictEqual(agent1.toolCall.name, 'check_availability');
  assert.strictEqual(agent1.toolCall.result.available, true);
  assert.strictEqual(agent1.toolCall.result.doctor, 'Dr. Arun Kumar');
  assert.ok(agent1.message.includes('Dr. Arun Kumar is available') || agent1.message.includes('available'));
  console.log('✓ PASS: Agent called check_availability and confirmed slot\n');

  // Test 5: End-to-End Agent - Unavailable slot request
  console.log('--- TEST 5: Agent Flow - Unavailable slot request ---');
  const agent2 = await generateAIResponse('Can I see Dr. Arun tomorrow at 10:30 AM?');
  console.log('Agent 2 Output:', agent2);
  assert.ok(agent2.toolCall, 'Agent must have called a tool');
  assert.strictEqual(agent2.toolCall.result.available, false);
  assert.ok(agent2.message.includes('already fully booked') || agent2.message.includes('different date') || agent2.message.includes('Alternative'));
  console.log('✓ PASS: Agent called check_availability and handled unavailable slot\n');

  // Test 6: End-to-End Agent - Unknown Doctor request
  console.log('--- TEST 6: Agent Flow - Unknown doctor request ---');
  const agent3 = await generateAIResponse('Can I book an appointment with Dr. Henderson tomorrow at 5 PM?');
  console.log('Agent 3 Output:', agent3);
  assert.ok(agent3.toolCall, 'Agent must have called a tool');
  assert.strictEqual(agent3.toolCall.result.error, 'UNKNOWN_DOCTOR');
  assert.ok(agent3.message.includes('not found') || agent3.message.includes('resident specialists') || agent3.message.includes('Dr. Arun Kumar'));
  console.log('✓ PASS: Agent handled unknown doctor gracefully\n');

  // Test 7: End-to-End Agent - Normal Question (No tool call)
  console.log('--- TEST 7: Agent Flow - Normal question (No tool call) ---');
  const agent4 = await generateAIResponse('What services do you provide?');
  console.log('Agent 4 Output:', agent4);
  assert.strictEqual(agent4.toolCall, undefined, 'Normal question must NOT call check_availability');
  assert.ok(agent4.message.includes('Dental Clinic offers comprehensive digital dental care'));
  console.log('✓ PASS: Normal question answered directly without calling tools\n');

  // Test 8: End-to-End Agent - Medical Question (Medical safety, no tool call)
  console.log('--- TEST 8: Agent Flow - Medical question (Safety compliance) ---');
  const agent5 = await generateAIResponse('Can you diagnose my tooth pain?');
  console.log('Agent 5 Output:', agent5);
  assert.strictEqual(agent5.toolCall, undefined, 'Medical question must NOT call availability tool');
  assert.ok(agent5.message.includes('cannot provide medical or dental diagnoses'));
  console.log('✓ PASS: Medical question triggered safety guardrail without tool call\n');

  // Test 9: Tool Registry Safety - Unknown tool execution
  console.log('--- TEST 9: Security Guard - Unregistered tool execution attempt ---');
  const badTool = await toolRegistry.execute('drop_database_table', {});
  console.log('Bad Tool Result:', badTool);
  assert.strictEqual(badTool.error, 'TOOL_NOT_FOUND');
  console.log('✓ PASS: Arbitrary tool execution strictly prohibited\n');

  // Test 10: Tool Failure Simulation
  console.log('--- TEST 10: Tool Failure Fallback ---');
  // Temporarily register a failing tool to test safety
  toolRegistry.register({
    name: 'failing_tool_test',
    description: 'Test tool that throws',
    parameters: {},
    execute: async () => { throw new Error('Database connection timeout simulation'); },
  });
  const failResult = await toolRegistry.execute('failing_tool_test', {});
  console.log('Failing Tool Result:', failResult);
  assert.strictEqual(failResult.error, 'TOOL_EXECUTION_ERROR');
  console.log('✓ PASS: Unexpected tool failure handled gracefully without crashing\n');

  // Test 11: Generic Staff Member parameter invocation
  console.log('--- TEST 11: Generic parameter check_availability (staffMember parameter) ---');
  const genericStaffCheck = await toolRegistry.execute('check_availability', {
    staffMember: 'Dr. Arun Kumar',
    date: '2026-10-08',
    time: '5:00 PM',
  });
  console.log('Generic Staff Check Result:', genericStaffCheck);
  assert.strictEqual(genericStaffCheck.available, true);
  assert.strictEqual(genericStaffCheck.staffMember, 'Dr. Arun Kumar');
  console.log('✓ PASS: check_availability works with generic staffMember parameter\n');

  // Test 12: Architecture Proof - Agent Core configured for another business without code changes
  console.log('--- TEST 12: Generic Reusability - Initialize Agent Core with custom business config ---');
  const sampleSalonConfig = {
    business: {
      id: 'salon-luxe-01',
      name: 'Luxe Salon & Spa',
      type: 'salon',
      tagline: 'Modern Hair & Wellness Studio',
      location: {
        address: '45 Fashion Avenue, New York, NY',
        landmark: 'Opposite Central Square',
      },
      contact: {
        phone: '+1 555-0199',
        email: 'hello@luxesalon.com',
      },
      operatingHours: {
        schedule: 'Monday – Friday: 9:00 AM – 7:00 PM',
        openHour: 9,
        closeHour: 19,
        daysOpen: [1, 2, 3, 4, 5],
      },
      staff: [
        {
          id: 'stylist-elena',
          name: 'Elena Rostova',
          role: 'Master Hair Stylist',
          experience: '10+ years experience',
          specialties: ['Balayage', 'Precision Cut', 'Bridal Styling'],
          availabilityDays: 'Monday to Friday',
        },
      ],
      services: [
        {
          category: 'Hair Styling',
          items: [
            { name: 'Balayage & Gloss', duration: '120 Minutes' },
            { name: 'Precision Cut', duration: '45 Minutes' },
          ],
        },
      ],
      safetyRules: [
        'Always conduct a 24-hour patch test prior to chemical treatments.',
      ],
      businessRules: [
        'Cancellations must be made at least 12 hours in advance.',
      ],
    },
  };

  const { AgentEngine } = await import('./core/AgentEngine.js');
  const { ToolRegistry: CoreToolRegistry } = await import('./core/ToolRegistry.js');
  const { createCheckAvailabilityTool } = await import('./core/tools/checkAvailability.js');

  const salonRegistry = new CoreToolRegistry();
  salonRegistry.register(createCheckAvailabilityTool(sampleSalonConfig));

  const salonAgent = new AgentEngine({
    businessConfig: sampleSalonConfig,
    toolRegistry: salonRegistry,
  });

  const salonResponse = await salonAgent.processMessage('Can I see Elena tomorrow at 5 PM?');
  console.log('Salon Agent Output:', salonResponse);
  assert.ok(salonResponse.toolCall, 'Salon agent should invoke check_availability');
  assert.strictEqual(salonResponse.toolCall.result.staffMember, 'Elena Rostova');
  assert.strictEqual(salonResponse.toolCall.result.available, true);
  console.log('✓ PASS: Agent Core works seamlessly for another business type without code modifications\n');

  console.log('===================================================');
  console.log('ALL 12 AGENT & ARCHITECTURE TESTS PASSED PERFECTLY!');
  console.log('===================================================');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
