// ====== Horarios por día ======
const scheduleByDay = {
  5: ['16:00','17:00','18:00','19:00','20:00','21:00'],
  6: ['10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00','20:00','21:00'],
  0: ['16:00','17:00','18:00','19:00','20:00','21:00']
};

// ====== Funciones de reservas ======
function getBookings() {
  return JSON.parse(localStorage.getItem('drvBookings') || '[]');
}

function saveBookings(bookings) {
  localStorage.setItem('drvBookings', JSON.stringify(bookings));
}

// ====== Render de reservas en panel ======
const bookingsList = document.getElementById('bookingsList');
if(bookingsList){
  function renderBookings() {
    const bookings = getBookings();
    bookingsList.innerHTML = bookings.length
      ? ''
      : '<p class="text-zinc-500">No hay reservas todavía.</p>';

    bookings.forEach((b, i) => {
      bookingsList.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h4 class="font-bold text-lg">${b.name}</h4>
            <p class="text-zinc-400">${b.service}</p>
            <p class="text-zinc-500 text-sm">${b.date} · ${b.time}</p>
          </div>
        </div>
      `;
    });
  }
  renderBookings();
}

// ====== Formulario de reserva ======
const form = document.getElementById('bookingForm');
if(form){
  const slotsPreview = document.getElementById('slotsPreview');
  const selectedDateSpan = document.getElementById('selectedDate');
  const datePicker = document.getElementById('datePicker');
  const waBtn = document.getElementById('waBtn');

  let selectedTime = null;


  // ====== Cargar horarios disponibles ======
  function loadTimes(dateStr=null){
    selectedTime = null;
    slotsPreview.innerHTML = '';

    if(!dateStr){
      slotsPreview.innerHTML = '<p class="text-zinc-500">Selecciona fecha primero.</p>';
      return;
    }

    const day = new Date(dateStr).getDay();
    const availableTimes = scheduleByDay[day] || [];
    const bookings = getBookings();
    const bookedTimes = bookings.filter(b=>b.date===dateStr).map(b=>b.time);
    const freeTimes = availableTimes.filter(t=>!bookedTimes.includes(t));

    if(freeTimes.length === 0){
      slotsPreview.innerHTML = '<p class="text-red-400 col-span-2">No hay horarios disponibles ese día.</p>';
      return;
    }

    freeTimes.forEach(time=>{
      const div = document.createElement('div');
      div.textContent = time;
      div.className = 'bg-zinc-900 border border-zinc-800 rounded-xl p-3 cursor-pointer hover:bg-amber-400 hover:text-black text-white';

      div.addEventListener('click',()=>{
        selectedTime = time;

        document.querySelectorAll('#slotsPreview div').forEach(d=>{
          d.classList.remove('bg-amber-400','text-black');
          d.classList.add('bg-zinc-900','text-white');
        });

        div.classList.add('bg-amber-400','text-black');
        div.classList.remove('bg-zinc-900','text-white');
      });

      slotsPreview.appendChild(div);
    });
  }

  // ====== Abrir calendario ======
  function openCalendar(){
    if(document.getElementById('calendarOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'calendarOverlay';
    overlay.className = 'absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-xl z-50';

    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    function renderCalendar(){
      overlay.innerHTML = '';

      const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

      overlay.innerHTML += `
        <div class="flex justify-between items-center mb-4">
          <button id="prevMonth" class="text-amber-400 font-bold">←</button>
          <h4 class="font-bold text-lg">${monthNames[currentMonth]} ${currentYear}</h4>
          <button id="nextMonth" class="text-amber-400 font-bold">→</button>
        </div>

        <div class="grid grid-cols-7 gap-2 text-center text-sm mb-3 text-zinc-400">
          <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
        </div>

        <div id="calendarDays" class="grid grid-cols-7 gap-2"></div>
      `;

      const calendarDays = overlay.querySelector('#calendarDays');
      const firstDay = new Date(currentYear,currentMonth,1);
      const lastDay = new Date(currentYear,currentMonth+1,0);
      let startDay = firstDay.getDay();
      startDay = startDay===0 ? 6 : startDay-1;

      for(let i=0;i<startDay;i++){
        calendarDays.innerHTML += `<div></div>`;
      }

      for(let day=1; day<=lastDay.getDate(); day++){
        const fullDate = new Date(currentYear,currentMonth,day);
        const dayOfWeek = fullDate.getDay();
        const isPast = fullDate < new Date().setHours(0,0,0,0);
        const allowedDay = [5,6,0].includes(dayOfWeek);

        let classes = 'p-2 rounded-lg text-center ';
        if(isPast || !allowedDay){
          classes += 'bg-zinc-800 text-zinc-600 cursor-not-allowed';
        } else {
          classes += 'bg-zinc-800 hover:bg-amber-400 hover:text-black cursor-pointer';
        }

        const dateString = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        calendarDays.innerHTML += `<div class="${classes}" data-date="${dateString}">${day}</div>`;
      }

      overlay.querySelector('#prevMonth').onclick = ()=>{
        if(currentMonth===0){ currentMonth=11; currentYear--; } else { currentMonth--; }
        if(currentYear < today.getFullYear() || (currentYear===today.getFullYear() && currentMonth<today.getMonth())){
          currentMonth=today.getMonth(); currentYear=today.getFullYear();
        }
        renderCalendar();
      };

      overlay.querySelector('#nextMonth').onclick = ()=>{
        if(currentMonth===11){ currentMonth=0; currentYear++; } else { currentMonth++; }
        renderCalendar();
      };

      overlay.querySelectorAll('[data-date]').forEach(day=>{
        if(!day.classList.contains('cursor-not-allowed')){
          day.onclick = ()=>{
            const selectedDate = day.dataset.date;
            selectedDateSpan.textContent = selectedDate;
            loadTimes(selectedDate);
            overlay.remove();
          };
        }
      });
    }

    renderCalendar();
    datePicker.appendChild(overlay);

    // Cerrar calendario al hacer click fuera
    document.addEventListener('click', (e)=>{
      if(!overlay.contains(e.target) && !datePicker.contains(e.target)){
        overlay.remove();
      }
    });
  }

  datePicker.addEventListener('click', openCalendar);

  // ====== Enviar reserva ======
  form.addEventListener('submit', e=>{
    e.preventDefault();

    if(selectedDateSpan.textContent==="Selecciona fecha"){
      alert("Selecciona fecha");
      return;
    }

    if(!selectedTime){
      alert("Selecciona hora");
      return;
    }

    const booking = {
      name:document.getElementById('name').value,
      phone:document.getElementById('phone').value,
      service:document.getElementById('service').value,
      date:selectedDateSpan.textContent,
      time:selectedTime
    };

    const bookings = getBookings();
    bookings.push(booking);
    saveBookings(bookings);

    form.reset();
    selectedDateSpan.textContent="Selecciona fecha";
    loadTimes();

    if(typeof renderBookings==='function') renderBookings();






    const message = `
    Nueva reserva DRV Studio 

    - Nombre: ${booking.name}
    - Teléfono: ${booking.phone}
    - Servicio: ${booking.service}
    - Fecha: ${booking.date}
    - Hora: ${booking.time}
    `;

    const whatsappURL = `https://wa.me/34601726229?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, '_blank');






  });
}

// ====== Render calendario de todas las reservas ======
const calendarContainer = document.getElementById("calendarContainer");
if(calendarContainer){
  renderCalendarBookings();
}

function renderCalendarBookings(){
  const calendarContainer = document.getElementById("calendarContainer");
  if(!calendarContainer) return;

  const bookings = getBookings();
  calendarContainer.innerHTML = "";

  if(bookings.length===0){
    calendarContainer.innerHTML=`<p class="text-zinc-500 col-span-3">No hay reservas todavía.</p>`;
    return;
  }

  bookings.sort((a,b)=>new Date(a.date)-new Date(b.date));

  bookings.forEach((booking,index)=>{
    calendarContainer.innerHTML += `
      <div class="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
        <p class="text-amber-400 font-bold mb-2">${booking.date}</p>
        <h3 class="text-2xl font-bold">${booking.name}</h3>
        <p class="text-zinc-400">${booking.service}</p>
        <p class="text-zinc-500 mt-2 mb-4">${booking.time}</p>
        <button onclick="cancelBooking(${index})" class="w-full bg-red-500 hover:bg-red-600 transition p-3 rounded-xl font-bold">Cancelar cita</button>
      </div>
    `;
  });
}

// ====== Cancelar reserva (solo 24h antes) ======
function cancelBooking(index){
  const bookings = getBookings();
  const booking = bookings[index];
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  const now = new Date();
  const diffHours = (bookingDateTime - now) / (1000*60*60);

  if(diffHours < 24){
    alert("❌ No puedes cancelar una cita con menos de 24 horas de antelación.");
    return;
  }

  if(!confirm(`¿Seguro que quieres cancelar la cita de ${booking.name}?`)) return;

  bookings.splice(index,1);
  saveBookings(bookings);
  renderCalendarBookings();
  alert("✅ Cita cancelada correctamente.");
}