document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const contactForm = document.getElementById('contactForm');
  const contactTable = document.getElementById('contactTable');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const noContacts = document.getElementById('noContacts');
  const searchInput = document.getElementById('searchInput');
  const cancelBtn = document.getElementById('cancelBtn');
  const submitBtn = document.getElementById('submitBtn');
  const formTitle = document.getElementById('formTitle');
  const contactIdInput = document.getElementById('contactId');
  
  // Modal
  const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
  let contactToDelete = null;

  // Estado de la aplicación
  let contacts = [];
  let isEditing = false;

  // Inicializar la aplicación
  init();

  // Funciones de inicialización
  function init() {
    loadContacts();
    setupEventListeners();
  }

  function setupEventListeners() {
    // Formulario
    contactForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelEdit);

    // Búsqueda
    searchInput.addEventListener('input', debounce(searchContacts, 300));

    // Modal de confirmación
    document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
  }

  // Funciones CRUD
  async function loadContacts() {
    try {
      showLoading();
      const response = await fetch('/api/contactos');
      contacts = await response.json();
      renderContacts(contacts);
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      showError('Error al cargar contactos');
    } finally {
      hideLoading();
    }
  }

  async function createContact(contactData) {
    try {
      const response = await fetch('/api/contactos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        throw new Error('Error al crear contacto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear contacto:', error);
      throw error;
    }
  }

  async function updateContact(id, contactData) {
    try {
      const response = await fetch(`/api/contactos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar contacto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar contacto:', error);
      throw error;
    }
  }

  async function deleteContact(id) {
    try {
      const response = await fetch(`/api/contactos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar contacto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      throw error;
    }
  }

  // Manejadores de eventos
  async function handleFormSubmit(e) {
    e.preventDefault();
    
    const contactData = {
      nombres: document.getElementById('nombres').value.trim(),
      apellidos: document.getElementById('apellidos').value.trim(),
      fecha_nacimiento: document.getElementById('fecha_nacimiento').value || null,
      direccion: document.getElementById('direccion').value.trim() || null,
      celular: document.getElementById('celular').value.trim() || null,
      correo: document.getElementById('correo').value.trim() || null
    };

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';

      if (isEditing) {
        const id = contactIdInput.value;
        await updateContact(id, contactData);
        showSuccess('Contacto actualizado correctamente');
      } else {
        await createContact(contactData);
        showSuccess('Contacto creado correctamente');
      }

      resetForm();
      await loadContacts();
    } catch (error) {
      showError(error.message || 'Ocurrió un error al guardar el contacto');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar';
    }
  }

  function editContact(id) {
    const contact = contacts.find(c => c.id == id);
    if (!contact) return;

    isEditing = true;
    contactIdInput.value = contact.id;
    document.getElementById('nombres').value = contact.nombres;
    document.getElementById('apellidos').value = contact.apellidos;
    document.getElementById('fecha_nacimiento').value = contact.fecha_nacimiento || '';
    document.getElementById('direccion').value = contact.direccion || '';
    document.getElementById('celular').value = contact.celular || '';
    document.getElementById('correo').value = contact.correo || '';

    formTitle.textContent = 'Editar Contacto';
    submitBtn.textContent = 'Actualizar';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll al formulario
    contactForm.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelEdit() {
    resetForm();
  }

  function promptDelete(id) {
    contactToDelete = id;
    confirmModal.show();
  }

  async function confirmDelete() {
    if (!contactToDelete) return;

    try {
      await deleteContact(contactToDelete);
      showSuccess('Contacto eliminado correctamente');
      await loadContacts();
    } catch (error) {
      showError(error.message || 'Ocurrió un error al eliminar el contacto');
    } finally {
      confirmModal.hide();
      contactToDelete = null;
    }
  }

  function searchContacts() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
      renderContacts(contacts);
      return;
    }

    const filteredContacts = contacts.filter(contact => 
      contact.nombres.toLowerCase().includes(searchTerm) ||
      contact.apellidos.toLowerCase().includes(searchTerm) ||
      (contact.celular && contact.celular.toLowerCase().includes(searchTerm)) ||
      (contact.correo && contact.correo.toLowerCase().includes(searchTerm))
    );

    renderContacts(filteredContacts);
  }

  // Funciones de renderizado
  function renderContacts(contactsToRender) {
    if (contactsToRender.length === 0) {
      contactTable.innerHTML = '';
      noContacts.style.display = 'block';
      return;
    }

    noContacts.style.display = 'none';
    
    const rows = contactsToRender.map(contact => {
      const age = contact.fecha_nacimiento ? calculateAge(contact.fecha_nacimiento) : '-';
      
      return `
        <tr>
          <td>${contact.nombres}</td>
          <td>${contact.apellidos}</td>
          <td>${age}</td>
          <td>${contact.celular || '-'}</td>
          <td>${contact.correo || '-'}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2" onclick="editContact(${contact.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="promptDelete(${contact.id})">Eliminar</button>
          </td>
        </tr>
      `;
    }).join('');

    contactTable.innerHTML = rows;
  }

  function resetForm() {
    contactForm.reset();
    isEditing = false;
    contactIdInput.value = '';
    formTitle.textContent = 'Nuevo Contacto';
    submitBtn.textContent = 'Guardar';
    cancelBtn.style.display = 'none';
  }

  // Funciones utilitarias
  function calculateAge(birthDate) {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function showLoading() {
    loadingSpinner.style.display = 'block';
    contactTable.innerHTML = '';
    noContacts.style.display = 'none';
  }

  function hideLoading() {
    loadingSpinner.style.display = 'none';
  }

  function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alert.style.zIndex = '1100';
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => alert.remove(), 150);
    }, 3000);
  }

  function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alert.style.zIndex = '1100';
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => alert.remove(), 150);
    }, 5000);
  }

  // Hacer funciones accesibles globalmente para los botones
  window.editContact = editContact;
  window.promptDelete = promptDelete;
});