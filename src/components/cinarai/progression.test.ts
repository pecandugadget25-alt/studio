import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateMasteryPercentage, calculateSessionXp, getNextStageId } from './progression';

test('returns the next unlocked stage in order', () => {
  assert.equal(getNextStageId(['cover']), 'contextualization');
  assert.equal(getNextStageId(['cover', 'contextualization']), 'identification');
});

test('calculates mastery percentage from completed stages', () => {
  assert.equal(calculateMasteryPercentage(['cover', 'contextualization']), 22);
  assert.equal(calculateMasteryPercentage(['cover', 'contextualization', 'identification', 'navigation', 'argumentation', 'resolution', 'application', 'introspection', 'report']), 100);
});

test('awards XP based on completed stages', () => {
  assert.equal(calculateSessionXp(['cover', 'contextualization']), 50);
  assert.equal(calculateSessionXp(['cover', 'contextualization', 'identification', 'navigation', 'argumentation', 'resolution', 'application', 'introspection', 'report']), 225);
});
