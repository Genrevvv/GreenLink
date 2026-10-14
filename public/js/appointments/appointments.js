let appointmentsData = [];

document.addEventListener("DOMContentLoaded", () => {
   // Load any saved requests from localStorage if available
   const savedRequests = localStorage.getItem('greenlink_appointments');
   if (savedRequests) {
       const parsed = JSON.parse(savedRequests);
       if (parsed.length > 0) {
           appointmentsData = parsed;
       }
   }
  
   renderAppointments();
});


function renderAppointments() {
   updateSummaryCards();
   renderTableRows();
   renderDetailsPanel();
}


function updateSummaryCards() {
   const totalEl = document.getElementById("total-count");
   const pendingEl = document.getElementById("pending-count");
   const approvedEl = document.getElementById("approved-count");


   if (totalEl) totalEl.textContent = appointmentsData.length;
   if (pendingEl) pendingEl.textContent = appointmentsData.filter(a => a.status === 'Pending').length;
   if (approvedEl) approvedEl.textContent = appointmentsData.filter(a => a.status === 'Approved').length;
}


function renderTableRows() {
   const tbody = document.getElementById("appointments-tbody");
   if (!tbody) return;


   tbody.innerHTML = "";


   if (appointmentsData.length === 0) {
       tbody.innerHTML = `
           <tr>
               <td colspan="6" style="padding: 2.5rem 1rem; text-align: center; color: var(--input-border); font-size: var(--font-xs);">
                   No appointment requests received yet.
               </td>
           </tr>
       `;
       return;
   }


   appointmentsData.forEach(apt => {
       const tr = document.createElement("tr");
       tr.style.cursor = "pointer";
       tr.style.borderBottom = "1px solid var(--clr-light)";
       if (selectedId === apt.id) {
           tr.style.backgroundColor = "#EAF4EF";
       }


       tr.innerHTML = `
           <td style="padding: 0.6rem; font-size: var(--font-xs); color: var(--darker-green);"><strong>${apt.customer}</strong></td>
           <td style="padding: 0.6rem; font-size: var(--font-xs); color: var(--dark-green);">${apt.date} <br><small>${apt.time}</small></td>
           <td style="padding: 0.6rem; font-size: var(--font-xs); color: var(--dark-green);">${apt.purpose}</td>
           <td style="padding: 0.6rem; font-size: var(--font-xs); color: var(--dark-green);">${apt.visitors}</td>
           <td style="padding: 0.6rem; font-size: var(--font-xs);">
               <span style="padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: bold; background-color: ${apt.status === 'Approved' ? 'var(--base-green)' : 'var(--yellow-green)'}; color: ${apt.status === 'Approved' ? '#fff' : 'var(--darker-green)'};">
                   ${apt.status}
               </span>
           </td>
           <td style="padding: 0.6rem; font-size: var(--font-xs);">
               ${apt.status === 'Pending' ? `
                   <button class="approve-btn" data-id="${apt.id}" style="padding: 0.25rem 0.5rem; background-color: var(--base-green); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer;"><i class="fa-solid fa-check"></i></button>
                   <button class="reject-btn" data-id="${apt.id}" style="padding: 0.25rem 0.5rem; background-color: var(--clr-failed); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
               ` : ''}
           </td>
       `;


       tr.addEventListener("click", () => {
           selectedId = apt.id;
           renderAppointments();
       });


       const approveBtn = tr.querySelector(".approve-btn");
       if (approveBtn) {
           approveBtn.addEventListener("click", (e) => {
               e.stopPropagation();
               handleApprove(apt.id);
           });
       }


       const rejectBtn = tr.querySelector(".reject-btn");
       if (rejectBtn) {
           rejectBtn.addEventListener("click", (e) => {
               e.stopPropagation();
               handleReject(apt.id);
           });
       }


       tbody.appendChild(tr);
   });
}


function renderDetailsPanel() {
   const container = document.getElementById("details-content");
   if (!container) return;


   const apt = appointmentsData.find(a => a.id === selectedId);


   if (!apt) {
       container.innerHTML = `
           <div class="flex flex-column align-center justify-center text-center py-8">
               <i class="fa-regular fa-calendar" style="font-size: 2rem; color: var(--input-border); margin-bottom: 0.5rem;"></i>
               <span class="text-xs" style="color: var(--dark-green);">Select an appointment to view details</span>
           </div>
       `;
       return;
   }


   container.innerHTML = `
       <div class="flex flex-column gap-3">
           <div style="background-color: #F8F9FA; padding: 0.75rem; border-radius: var(--radius-md);">
               <span class="text-xs" style="color: var(--dark-green); display: block; margin-bottom: 0.2rem;">Customer Name</span>
               <strong style="color: var(--darker-green); font-size: var(--font-xs);">${apt.customer}</strong>
           </div>
           <div style="background-color: #F8F9FA; padding: 0.75rem; border-radius: var(--radius-md);">
               <span class="text-xs" style="color: var(--dark-green); display: block; margin-bottom: 0.2rem;">Email</span>
               <strong style="color: var(--darker-green); font-size: var(--font-xs);">${apt.email}</strong>
           </div>
           <div style="background-color: #F8F9FA; padding: 0.75rem; border-radius: var(--radius-md);">
               <span class="text-xs" style="color: var(--dark-green); display: block; margin-bottom: 0.2rem;">Date & Time</span>
               <strong style="color: var(--darker-green); font-size: var(--font-xs);">${apt.date} at ${apt.time}</strong>
           </div>
           <div style="background-color: #F8F9FA; padding: 0.75rem; border-radius: var(--radius-md);">
               <span class="text-xs" style="color: var(--dark-green); display: block; margin-bottom: 0.2rem;">Visitors & Purpose</span>
               <strong style="color: var(--darker-green); font-size: var(--font-xs);">${apt.visitors} visitors - ${apt.purpose}</strong>
           </div>
           <div style="background-color: #F8F9FA; padding: 0.75rem; border-radius: var(--radius-md);">
               <span class="text-xs" style="color: var(--dark-green); display: block; margin-bottom: 0.2rem;">Notes</span>
               <span style="color: var(--clr-text); font-size: var(--font-xs);">${apt.notes || 'No notes provided.'}</span>
           </div>
       </div>
   `;
}


function handleApprove(id) {
   appointmentsData = appointmentsData.map(a => a.id === id ? { ...a, status: 'Approved' } : a);
   localStorage.setItem('greenlink_appointments', JSON.stringify(appointmentsData));
   renderAppointments();
}


function handleReject(id) {
   if (confirm("Are you sure you want to reject this request?")) {
       appointmentsData = appointmentsData.filter(a => a.id !== id);
       if (selectedId === id) selectedId = null;
       localStorage.setItem('greenlink_appointments', JSON.stringify(appointmentsData));
       renderAppointments();
   }
}