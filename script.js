// ====== Horarios ======
const scheduleByDay = {
  5: ['16:00','17:00','18:00','19:00','20:00','21:00'],
  6: ['10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00','20:00','21:00'],
  0: ['16:00','17:00','18:00','19:00','20:00','21:00']
};

// ====== RESERVAS ======
function getBookings(){
    return JSON.parse(localStorage.getItem('drvBookings') || '[]');
}

function saveBookings(bookings){
    localStorage.setItem('drvBookings', JSON.stringify(bookings));
}


// ====== RENDER BOOKINGS ======
const bookingsList = document.getElementById('bookingsList');

if(bookingsList){

    function renderBookings(){

        const bookings = getBookings();

        bookingsList.innerHTML = bookings.length
        ? ''
        : '<p class="text-zinc-500">No hay reservas todavía.</p>';

        bookings.forEach(b=>{

            bookingsList.innerHTML += `
            
            <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            
                <h4 class="font-bold">${b.name}</h4>
                <p>${b.service}</p>
                <p>${b.date} · ${b.time}</p>

            </div>
            
            `;

        });

    }

    renderBookings();

}



// ====== FORMULARIO RESERVA ======
const form = document.getElementById('bookingForm');

if(form){

    const slotsPreview = document.getElementById('slotsPreview');
    const selectedDateSpan = document.getElementById('selectedDate');
    const datePicker = document.getElementById('datePicker');

    let selectedTime = null;
    let currentDate = new Date();
    let calendarMonth = currentDate.getMonth();
    let calendarYear = currentDate.getFullYear();


    function loadTimes(dateStr=null){

        selectedTime = null;
        slotsPreview.innerHTML = '';

        if(!dateStr){

            slotsPreview.innerHTML =
            '<p class="text-zinc-500">Selecciona fecha primero.</p>';

            return;

        }

        const day = new Date(dateStr).getDay();

        const availableTimes = scheduleByDay[day] || [];

        const bookings = getBookings();

        const bookedTimes = bookings
        .filter(b=>b.date===dateStr)
        .map(b=>b.time);

        const freeTimes = availableTimes.filter(
            t=>!bookedTimes.includes(t)
        );

        freeTimes.forEach(time=>{

            const div = document.createElement('div');

            div.textContent = time;

            div.className =
            'bg-zinc-900 border border-zinc-800 rounded-xl p-3 cursor-pointer hover:bg-amber-400 hover:text-black';

            div.addEventListener('click',()=>{

                selectedTime = time;

                document.querySelectorAll('#slotsPreview div')
                .forEach(d=>d.classList.remove('bg-amber-400','text-black'));

                div.classList.add('bg-amber-400','text-black');

            });

            slotsPreview.appendChild(div);

        });

    }


    function openCalendar(){

        if(document.getElementById('calendarOverlay')) return;

        const overlay = document.createElement('div');

        overlay.id='calendarOverlay';

        overlay.className='absolute bg-zinc-900 border border-zinc-700 rounded-xl p-4 mt-2';

        overlay.innerHTML=`<p class="text-zinc-400">Calendario próximamente mejorado 🔥</p>`;

        datePicker.appendChild(overlay);

    }

    datePicker.addEventListener('click',openCalendar);


    form.addEventListener('submit',e=>{

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

        alert("Reserva guardada 🔥");

        form.reset();

        selectedDateSpan.textContent="Selecciona fecha";

        loadTimes();

    });

}


// ====== CALENDAR.HTML ======
const calendarContainer = document.getElementById("calendarContainer");

if(calendarContainer){

    renderCalendarBookings();

}

function renderCalendarBookings(){

    if(!calendarContainer) return;

    const bookings = getBookings();

    calendarContainer.innerHTML = "";

    if(bookings.length===0){

        calendarContainer.innerHTML=`
        <p class="text-zinc-500 col-span-3">
            No hay reservas todavía.
        </p>
        `;

        return;
    }

    bookings.sort((a,b)=>new Date(a.date)-new Date(b.date));

    bookings.forEach((booking,index)=>{

        calendarContainer.innerHTML += `
        
        <div class="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">

            <p class="text-amber-400 font-bold mb-2">
                ${booking.date}
            </p>

            <h3 class="text-2xl font-bold">
                ${booking.name}
            </h3>

            <p class="text-zinc-400">
                ${booking.service}
            </p>

            <p class="text-zinc-500 mt-2 mb-4">
                ${booking.time}
            </p>

            <button onclick="cancelBooking(${index})"
            class="w-full bg-red-500 hover:bg-red-600 transition p-3 rounded-xl font-bold">
                Cancelar cita
            </button>

        </div>
        
        `;
    });

}


// ====== CANCELAR RESERVA ======
function cancelBooking(index){

    const bookings = getBookings();

    const booking = bookings[index];

    const bookingDateTime = new Date(`${booking.date}T${booking.time}`);

    const now = new Date();

    const diffHours = (bookingDateTime - now) / (1000 * 60 * 60);

    if(diffHours < 24){

        alert("❌ No puedes cancelar una cita con menos de 24 horas de antelación.");

        return;
    }

    const confirmCancel = confirm(
        `¿Seguro que quieres cancelar la cita de ${booking.name}?`
    );

    if(!confirmCancel) return;

    bookings.splice(index,1);

    saveBookings(bookings);

    renderCalendarBookings();

    alert("✅ Cita cancelada correctamente.");

}