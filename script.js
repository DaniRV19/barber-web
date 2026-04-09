const scheduleByDay = {
  5: ['16:00','17:00','18:00','19:00','20:00','21:00'],
  6: ['10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00','20:00','21:00'],
  0: ['16:00','17:00','18:00','19:00','20:00','21:00']
};
const timeSelect = document.getElementById('time');
const slotsPreview = document.getElementById('slotsPreview');
const form = document.getElementById('bookingForm');
const bookingsList = document.getElementById('bookingsList');
const successMsg = document.getElementById('successMsg');
const dateInput = document.getElementById('date');

function loadTimes(selectedDate = null){
  timeSelect.innerHTML = '<option value="">Selecciona hora</option>';
  slotsPreview.innerHTML = '';

  if(!selectedDate){
    slotsPreview.innerHTML = '<p class="text-zinc-500 col-span-2">Selecciona una fecha para ver horarios.</p>';
    return;
  }

  const day = new Date(selectedDate).getDay();
  const availableTimes = scheduleByDay[day] || [];

  if(availableTimes.length === 0){
    slotsPreview.innerHTML = '<p class="text-red-400 col-span-2">No disponible ese día.</p>';
    return;
  }

  availableTimes.forEach(time => {
    timeSelect.innerHTML += `<option>${time}</option>`;
    slotsPreview.innerHTML += `<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">${time}</div>`;
  });
}

function getBookings(){
  return JSON.parse(localStorage.getItem('drvBookings') || '[]');
}

function saveBookings(bookings){
  localStorage.setItem('drvBookings', JSON.stringify(bookings));
}

function renderBookings(){
  const bookings = getBookings();
  bookingsList.innerHTML = bookings.length ? '' : '<p class="text-zinc-500">No hay reservas todavía.</p>';
  bookings.forEach((booking, index) => {
    bookingsList.innerHTML += `
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h4 class="font-bold text-lg">${booking.name}</h4>
          <p class="text-zinc-400">${booking.service}</p>
          <p class="text-zinc-500 text-sm">${booking.date} · ${booking.time}</p>
        </div>
        
      </div>`;
  });
}

form.addEventListener('submit', function(e){
  e.preventDefault();

  const selectedDate = document.getElementById('date').value;
  const selectedDay = new Date(selectedDate).getDay();

  if(!scheduleByDay[selectedDay]){
    alert('Solo se aceptan reservas viernes tarde, sábado completo y domingo tarde.');
    return;
  }

  const booking = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    service: document.getElementById('service').value,
    date: selectedDate,
    time: document.getElementById('time').value,
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
  renderBookings();

  alert('🔔 Nueva reserva recibida de ' + booking.name);

  const waMessage = encodeURIComponent(`Hola DRV, quiero confirmar mi cita:%0A${booking.name}%0A${booking.service}%0A${booking.date} ${booking.time}`);
  document.getElementById('waBtn').href = `https://wa.me/34600000000?text=${waMessage}`;

  form.reset();
  document.getElementById('thankyou').classList.remove('hidden');
  document.getElementById('thankyou').scrollIntoView({ behavior: 'smooth' });
});

const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .split('T')[0];

dateInput.min = localToday;

dateInput.addEventListener('change', (e) => loadTimes(e.target.value));

loadTimes();
renderBookings();