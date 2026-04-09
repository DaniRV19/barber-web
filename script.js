// ====== Horarios por día ======
const scheduleByDay = {
  5: ['16:00','17:00','18:00','19:00','20:00','21:00'], // Viernes
  6: ['10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00','20:00','21:00'], // Sábado
  0: ['16:00','17:00','18:00','19:00','20:00','21:00'] // Domingo
};

// ====== DOM Elements ======
const timeSelect = document.getElementById('time');
const slotsPreview = document.getElementById('slotsPreview');
const form = document.getElementById('bookingForm');
const bookingsList = document.getElementById('bookingsList');
const datePicker = document.getElementById('datePicker');
const selectedDateSpan = document.getElementById('selectedDate');

let currentDate = new Date();
let calendarMonth = currentDate.getMonth();
let calendarYear = currentDate.getFullYear();

// ====== Funciones de reservas ======
function getBookings(){
  return JSON.parse(localStorage.getItem('drvBookings') || '[]');
}
function saveBookings(bookings){
  localStorage.setItem('drvBookings', JSON.stringify(bookings));
}
function renderBookings(){
  const bookings = getBookings();
  bookingsList.innerHTML = bookings.length ? '' : '<p class="text-zinc-500">No hay reservas todavía.</p>';
  bookings.forEach((booking) => {
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

// ====== Cargar horarios disponibles ======
function loadTimes(dateStr = null){
  timeSelect.innerHTML = '<option value="">Selecciona hora</option>';
  slotsPreview.innerHTML = '';

  if(!dateStr){
    slotsPreview.innerHTML = '<p class="text-zinc-500 col-span-2">Selecciona una fecha para ver horarios.</p>';
    return;
  }

  const day = new Date(dateStr).getDay();
  const availableTimes = scheduleByDay[day] || [];
  if(availableTimes.length === 0){
    slotsPreview.innerHTML = '<p class="text-red-400 col-span-2">No hay horarios disponibles ese día.</p>';
    return;
  }

  const bookings = getBookings();
  const bookedTimes = bookings.filter(b => b.date === dateStr).map(b => b.time);
  const freeTimes = availableTimes.filter(t => !bookedTimes.includes(t));

  if(freeTimes.length === 0){
    slotsPreview.innerHTML = '<p class="text-red-400 col-span-2">Todos los horarios están reservados.</p>';
    return;
  }

  freeTimes.forEach(time => {
    timeSelect.innerHTML += `<option>${time}</option>`;
    slotsPreview.innerHTML += `<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">${time}</div>`;
  });
}

// ====== Calendario propio ======
function openCalendar(){
  if(document.getElementById('calendarOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'calendarOverlay';
  overlay.className = 'absolute bg-zinc-900 border border-zinc-700 rounded-xl p-4 mt-2 shadow-xl z-50';
  
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center mb-2';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '<';
  prevBtn.className = 'px-2 py-1 bg-zinc-800 rounded hover:bg-zinc-700';
  prevBtn.disabled = calendarMonth === currentDate.getMonth() && calendarYear === currentDate.getFullYear();
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if(calendarMonth === 0){ calendarMonth = 11; calendarYear--; } 
    else calendarMonth--;
    overlay.remove(); renderCalendar();
  });

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '>';
  nextBtn.className = 'px-2 py-1 bg-zinc-800 rounded hover:bg-zinc-700';
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if(calendarMonth === 11){ calendarMonth = 0; calendarYear++; } 
    else calendarMonth++;
    overlay.remove(); renderCalendar();
  });

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const monthLabel = document.createElement('span');
  monthLabel.textContent = `${monthNames[calendarMonth]} ${calendarYear}`;
  monthLabel.className = 'font-bold text-amber-400';

  header.appendChild(prevBtn); header.appendChild(monthLabel); header.appendChild(nextBtn);
  overlay.appendChild(header);

  const daysRow = document.createElement('div');
  daysRow.className = 'grid grid-cols-7 text-center text-zinc-400 mb-1';
  ['L','M','X','J','V','S','D'].forEach(d => {
    const dayEl = document.createElement('div');
    dayEl.textContent = d;
    daysRow.appendChild(dayEl);
  });
  overlay.appendChild(daysRow);

  const datesGrid = document.createElement('div');
  datesGrid.className = 'grid grid-cols-7 text-center gap-1';

  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth+1,0).getDate();
  let startOffset = firstDay === 0 ? 6 : firstDay-1;

  for(let i=0;i<startOffset;i++){ datesGrid.appendChild(document.createElement('div')); }

  for(let day=1;day<=daysInMonth;day++){
    const cell = document.createElement('div');
    cell.textContent = day;
    cell.className = 'p-2 rounded hover:bg-amber-400 hover:text-black cursor-pointer';
    const cellDate = new Date(calendarYear, calendarMonth, day);
    if(cellDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())){
      cell.className += ' text-zinc-600 cursor-not-allowed hover:bg-transparent hover:text-zinc-600';
    } else {
      cell.addEventListener('click',(e)=>{
        e.stopPropagation();
        const isoDate = `${calendarYear}-${String(calendarMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        selectedDateSpan.textContent = `${String(day).padStart(2,'0')}/${String(calendarMonth+1).padStart(2,'0')}/${calendarYear}`;
        loadTimes(isoDate);
        overlay.remove();
      });
    }
    datesGrid.appendChild(cell);
  }

  overlay.appendChild(datesGrid);
  datePicker.appendChild(overlay);

  document.addEventListener('click', function close(e){
    if(!overlay.contains(e.target) && e.target !== datePicker){
      overlay.remove(); document.removeEventListener('click', close);
    }
  });
}
function renderCalendar(){ openCalendar(); }

datePicker.addEventListener('click',(e)=>{ e.stopPropagation(); renderCalendar(); });

// ====== Enviar formulario ======
form.addEventListener('submit', function(e){
  e.preventDefault();
  const dateText = selectedDateSpan.textContent;
  if(dateText === 'Selecciona fecha'){ alert('❌ Selecciona una fecha.'); return; }
  const isoDate = `${dateText.split('/')[2]}-${dateText.split('/')[1]}-${dateText.split('/')[0]}`;
  if(!timeSelect.value){ alert('❌ Selecciona una hora.'); return; }

  const booking = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    service: document.getElementById('service').value,
    date: isoDate,
    time: timeSelect.value
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
  renderBookings();
  loadTimes(isoDate);

  const waMessage = encodeURIComponent(`Hola DRV, quiero confirmar mi cita:%0A${booking.name}%0A${booking.service}%0A${booking.date} ${booking.time}`);
  document.getElementById('waBtn').href = `https://wa.me/34600000000?text=${waMessage}`;

  form.reset();
  selectedDateSpan.textContent = 'Selecciona fecha';
  document.getElementById('thankyou').classList.remove('hidden');
  document.getElementById('thankyou').scrollIntoView({ behavior: 'smooth' });
});

// ====== Inicial ======
loadTimes();
renderBookings();