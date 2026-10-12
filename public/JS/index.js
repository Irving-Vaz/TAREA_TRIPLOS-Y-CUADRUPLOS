
const expresion = document.getElementById('expresion');
const maquinaDeOperaciones = document.getElementById('maquinaDeOperaciones');
const barredora = document.getElementById('barredora');
const triplete = document.getElementById('triplete');
const cuarteto = document.getElementById('cuarteto');
const bocina = document.getElementById('bocina');

const operadores = ['+', '-', '*', '/', '^'];

const prioridad = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3
};

const obtenerTokens = (texto) => {
    const tokens = texto.match(/[a-zA-Z][a-zA-Z0-9]*|\d+(?:\.\d+)?|[()+\-*/^]/g);

    if (!tokens || tokens.join('') !== texto.replace(/\s/g, '')) {
        throw new Error("Facor de revisar la expresion");
    }

    return tokens;
};

const convertirPosfija = (tokens) => {
    const salida = [];
    const pila = [];
    let esperarOperando = true;

    tokens.forEach(token => {
        if (/^[a-zA-Z]|\d/.test(token)) {
            if (!esperarOperando) {
                throw new Error("Le falta un operador entre los elemntos");
            }

            salida.push(token);
            esperarOperando = false;
        } else if (token === '(') {
            if (!esperarOperando) {
                throw new Error('Falta un operador antes del parentesis');
            }

            pila.push(token);
        } else if (token === ')') {
            if (esperarOperando) {
                throw new Error('tiene un parentesis vacio');
            }

            while (pila.length && pila[pila.length - 1] !== '(') {
                salida.push(pila.pop());
            }

            if (!pila.length) {
                throw new Error('tiene un parentesis extra o le falta uno de cierre');
            }

            pila.pop();
            esperarOperando = false;
        } else if (operadores.includes(token)) {
            if (esperarOperando) {
                throw new Error('un operador no esta en el lugar correcto');
            }

            while (pila.length && operadores.includes(pila[pila.length - 1]) &&
                (prioridad[pila[pila.length - 1]] > prioridad[token] ||
                (prioridad[pila[pila.length - 1]] === prioridad[token] && token !== '^'))) {
                salida.push(pila.pop());
            }

            pila.push(token);
            esperarOperando = true;
        }
    });

    if (esperarOperando) {
        throw new Error('operacion incompleta');
    }

    while (pila.length) {
        const operador = pila.pop();

        if (operador === '(') {
            throw new Error('favor de revisar parentesis');
        }

        salida.push(operador);
    }

    return salida;
};

const generarTablas = (posfija) => {
    const pila = [];
    const triplos = [];
    const cuadruplos = [];

    posfija.forEach(token => {
        if (!operadores.includes(token)) {
            pila.push({
                triplo: token,
                cuadruplo: token
            });
        } else {
            if (pila.length < 2) {
                throw new Error("Operacion no valida");
            }

            const derecho = pila.pop();
            const izquierdo = pila.pop();
            const numero = triplos.length;
            const temporal = `T${numero + 1}`;

            triplos.push({
                numero,
                operador: token,
                operando1: izquierdo.triplo,
                operando2: derecho.triplo
            });

            cuadruplos.push({
                numero,
                operador: token,
                operando1: izquierdo.cuadruplo,
                operando2: derecho.cuadruplo,
                resultado: temporal
            });

            pila.push({
                triplo: `(${numero})`,
                cuadruplo: temporal
            });
        }
    });

    if (pila.length !== 1) {
        throw new Error("Operacion no valida, favor de revisar");
    }

    return { triplos, cuadruplos };
};

const mostrarTablas = (datos) => {
    triplete.innerHTML = '';
    cuarteto.innerHTML = '';

    datos.triplos.forEach(fila => {
        triplete.innerHTML += `
            <tr>
                <td>${fila.numero}</td>
                <td>${fila.operador}</td>
                <td>${fila.operando1}</td>
                <td>${fila.operando2}</td>
            </tr>`;
    });

    datos.cuadruplos.forEach(fila => {
        cuarteto.innerHTML += `
            <tr>
                <td>${fila.numero}</td>
                <td>${fila.operador}</td>
                <td>${fila.operando1}</td>
                <td>${fila.operando2}</td>
                <td>${fila.resultado}</td>
            </tr>`;
    });
};

maquinaDeOperaciones.addEventListener('click', () => {
    try {
        const texto = expresion.value.trim();

        if (texto === '') {
            throw new Error("Ingresar una operacion matematica");
        }

        const tokens = obtenerTokens(texto);
        const posfija = convertirPosfija(tokens);
        const datos = generarTablas(posfija);

        mostrarTablas(datos);
        bocina.innerHTML = '<div class="alert alert-success">operacion procesada.</div>';
    } catch (error) {
        triplete.innerHTML = '';
        cuarteto.innerHTML = '';
        bocina.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
});

barredora.addEventListener('click', () => {
    expresion.value = '';
    triplete.innerHTML = '';
    cuarteto.innerHTML = '';
    bocina.innerHTML = '';
    expresion.focus();
});
