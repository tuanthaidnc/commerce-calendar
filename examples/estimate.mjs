import {createCalendar, estimateDelivery} from '../index.js';

const calendar = createCalendar({
  timeZone: 'America/Los_Angeles',
  recurringHolidays: ['01-01', '05-01'],
  closedDates: []
});
console.log(estimateDelivery({
  calendar,
  orderedAt: '2026-09-22T12:00:00-07:00',
  processing: {min: 5, max: 7},
  shipping: {min: 7, max: 12}
}));
