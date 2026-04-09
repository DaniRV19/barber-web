  const form = document.getElementById('bookingForm');
  const successMsg = document.getElementById('successMsg');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    successMsg.classList.remove('hidden');
    form.reset();
  });