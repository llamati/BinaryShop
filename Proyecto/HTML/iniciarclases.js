 const usuarios = {
      comprador: [
        { usuario: 'comprador1', password: 'comp123' },
        { usuario: 'comprador2', password: 'comp456' },
        { usuario: 'comprador3', password: 'comp789' }
      ],
      vendedor: [
        { usuario: 'vendedor1', password: 'vend123' },
        { usuario: 'vendedor2', password: 'vend456' },
        { usuario: 'vendedor3', password: 'vend789' }
      ],
      administrador: [
        { usuario: 'admin1', password: 'admin123' },
        { usuario: 'admin2', password: 'admin456' },
        { usuario: 'admin3', password: 'admin789' }
      ]
    };

    document.getElementById('loginForm').addEventListener('submit', function (e) {
      e.preventDefault();

      const rolSeleccionado = document.querySelector('input[name="rol"]:checked').value;
      const usuario = document.getElementById('usuario').value.trim();
      const password = document.getElementById('password').value.trim();
      const mensaje = document.getElementById('mensajeError');
      mensaje.classList.remove('error');

      let vendedoresBloqueados;
      try {
        vendedoresBloqueados = JSON.parse(
          localStorage.getItem('vendedoresBloqueados') || '[]'
        );
        if (!Array.isArray(vendedoresBloqueados)) {
          throw new Error('La lista de cuentas bloqueadas no es válida.');
        }
      } catch (error) {
        console.error('No se pudo verificar el estado de la cuenta:', error);
        mensaje.textContent = 'No se pudo verificar el estado de la cuenta. Intenta de nuevo.';
        mensaje.classList.add('error');
        return;
      }

      if (vendedoresBloqueados.some((cuenta) => String(cuenta).toLowerCase() === usuario.toLowerCase())) {
        mensaje.textContent = 'Esta cuenta ha sido baneada y no puede iniciar sesión. Contacta al administrador.';
        mensaje.classList.add('error');
        return;
      }

      const rolesPermitidos = {
        comprador: ['comprador', 'vendedor'],
        vendedor: ['vendedor', 'comprador'],
        administrador: ['administrador']
      };

      let rolValido = null;

      for (const [rol, listado] of Object.entries(usuarios)) {
        const cuenta = listado.find(
          (u) => u.usuario === usuario && u.password === password
        );

        if (cuenta && rolesPermitidos[rolSeleccionado]?.includes(rol)) {
          rolValido = rol;
          break;
        }
      }

      if (!rolValido) {
        mensaje.textContent = 'Usuario o contraseña incorrectos para este rol.';
        return;
      }

      mensaje.textContent = '';
      localStorage.setItem('rolActual', rolSeleccionado);
      localStorage.setItem('usuarioActual', usuario);

      if (rolSeleccionado === 'administrador') {
        window.location.href = 'Admi.html';
      } else if (rolSeleccionado === 'comprador') {
        window.location.href = rolValido === 'vendedor' ? 'vendedor.html' : 'Catalogo.html';
      } else {
        window.location.href = rolValido === 'comprador' ? 'Catalogo.html' : 'Publicar.html';
      }
    });

    const rolGuardado = localStorage.getItem('rolActual');
    if (rolGuardado) {
      const inputs = document.querySelectorAll('input[name="rol"]');
      inputs.forEach((input) => {
        if (input.value === rolGuardado) {
          input.checked = true;
        }
      });
    }
