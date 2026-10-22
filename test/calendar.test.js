import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCalendar, estimateDelivery} from '../index.js';
const calendar = createCalendar({timeZone: 'America/Los_Angeles', recurringHolidays: ['01-01', '05-01']});

test('instant uses store civil date, including DST boundary', () => {
  assert.equal(calendar.dateAt('2026-03-08T07:59:00Z'), '2026-03-07');
  assert.equal(calendar.dateAt('2026-03-08T08:00:00Z'), '2026-03-08');
  assert.equal(calendar.addBusinessDays('2026-03-06', 1), '2026-03-09');
  assert.equal(calendar.addBusinessDays('2026-10-30', 1), '2026-11-02');
});
test('starts after supplied date; skips weekends and holidays without observed days', () => {
  assert.equal(calendar.addBusinessDays('2026-04-30', 1), '2026-05-04');
  assert.equal(calendar.addBusinessDays('2021-12-31', 1), '2022-01-03');
  assert.equal(calendar.isBusinessDay('2021-12-31'), true);
  assert.equal(calendar.addBusinessDays('2026-05-02', 0), '2026-05-02');
});
test('explicit closures, custom working week and leap day', () => {
  const custom = createCalendar({timeZone: 'UTC', workingWeekdays: [0,1,2,3,4], closedDates: ['2028-02-29']});
  assert.equal(custom.addBusinessDays('2028-02-28', 1), '2028-03-01');
  assert.equal(custom.addBusinessDays('2028-03-02', 1), '2028-03-05');
});
test('processing completes before shipping; independent expected endpoints', () => {
  assert.deepEqual(estimateDelivery({calendar, orderedAt: '2026-09-22T12:00:00-07:00', processing: {min:5,max:7}, shipping: {min:7,max:12}}), {
    orderDate: '2026-09-22', processingEnd: {earliest:'2026-09-29',latest:'2026-10-01'},
    arrival: {earliest:'2026-10-08',latest:'2026-10-19'}
  });
});
test('missing timing stays unknown; invalid timing is rejected', () => {
  assert.equal(estimateDelivery({calendar, orderedAt: '2026-09-22T00:00:00Z', shipping:{min:1,max:2}}), null);
  for (const processing of [{min:3,max:2},{min:-1,max:2},{min:1.5,max:2},{min:NaN,max:2}]) {
    assert.throws(() => estimateDelivery({calendar, orderedAt:'2026-09-22T00:00:00Z',processing,shipping:{min:1,max:2}}), RangeError);
  }
});
test('rejects impossible dates, ambiguous timestamps and invalid configuration', () => {
  for (const date of ['2026-02-29','2026-13-01','2026-2-01']) assert.throws(() => calendar.isBusinessDay(date));
  for (const instant of ['2026-01-01','2026-01-01T12:00:00','2026-02-30T00:00:00Z',new Date(NaN)]) assert.throws(() => calendar.dateAt(instant));
  for (const options of [{timeZone:'bad/zone'},{timeZone:'UTC',workingWeekdays:[]},{timeZone:'UTC',recurringHolidays:['02-30']}]) assert.throws(() => createCalendar(options));
});
test('calendar snapshots caller arrays', () => {
  const days = [1], closedDates = [];
  const c = createCalendar({timeZone:'UTC',workingWeekdays:days,closedDates});
  days.push(2); closedDates.push('2026-09-21');
  assert.equal(c.isBusinessDay('2026-09-21'),true);
  assert.equal(c.isBusinessDay('2026-09-22'),false);
});
