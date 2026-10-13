const expresion = document.getElementById('expresion');
const maquinaDeOperaciones = document.getElementById('maquinaDeOperaciones');
const barredora = document.getElementById('barredora');
const triplete = document.getElementById('triplete');
const cuarteto = document.getElementById('cuarteto');
const resultadoOperacion = document.getElementById('resultadoOperacion');

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
        throw new Error('Favor de revisar la expresion');
    }

    return tokens;
};

const convertirPosfija = (tokens) => {
    const salida = [];
    const pila = [];
    let esperarOperando = true;

    tokens.forEach(token => {
        if (/^[a-zA-Z][a-zA-Z0-9]*$|^\d+(?:\.\d+)?$/.test(token)) {
            if (!esperarOperando) {
                throw new Error('Falta un operador entre los elementos.');
            }

            salida.push(token);
            esperarOperando = false;

        } else if (token === '(') {
            if (!esperarOperando) {
                throw new Error('Falta un operador antes del paréntesis.');
            }

            pila.push(token);

        } else if (token === ')') {
            if (esperarOperando) {
                throw new Error('El parentesis esta vacio o la expresión está incompleta');
            }

            while (pila.length > 0 && pila[pila.length - 1] !== '(') {
                salida.push(pila.pop());
            }

            if (pila.length === 0) {
                throw new Error('Los parentesis no estaan equilibrados');
            }

            pila.pop();
            esperarOperando = false;

        } else if (operadores.includes(token)) {
            if (esperarOperando) {
                throw new Error('El operador esta en una posicion incorrecta');
            }

            while (
                pila.length > 0 &&
                operadores.includes(pila[pila.length - 1]) &&
                (
                    prioridad[pila[pila.length - 1]] > prioridad[token] ||
                    (
                        prioridad[pila[pila.length - 1]] === prioridad[token] &&
                        token !== '^'
                    )
                )
            ) {
                salida.push(pila.pop());
            }

            pila.push(token);
            esperarOperando = true;
        }
    });

    if (esperarOperando) {
        throw new Error('La operación esta incompleta.');
    }

    while (pila.length > 0) {
        const operador = pila.pop();

        if (operador === '(') {
            throw new Error('Favor de revisar los parentesis');
        }

        salida.push(operador);
    }

    return salida;
};

const calcular = (operador, a, b) => {
    if (a === null || b === null) {
        return null;
    }

    if (operador === '+') {
        return a + b;
    } else if (operador === '-') {
        return a - b;
    } else if (operador === '*') {
        return a * b;
    } else if (operador === '/') {
        if (b === 0) {
            throw new Error('No se puede dividir entre cero');
        }

        return a / b;
    } else if (operador === '^') {
        return a ** b;
    }
};

const generarTablas = (posfija) => {
    const pila = [];
    const triplos = [];
    const cuadruplos = [];

    posfija.forEach(token => {
        if (!operadores.includes(token)) {
            let valor = null;

            if (!isNaN(token)) {
                valor = Number(token);
            }

            pila.push({
                triplo: token,
                cuadruplo: token,
                valor: valor
            });

        } else {
            if (pila.length < 2) {
                throw new Error('La expresión no es válida.');
            }

            const derecho = pila.pop();
            const izquierdo = pila.pop();

            const numero = triplos.length;
            const temporal = 'T' + (numero + 1);

            const valor = calcular(
                token,
                izquierdo.valor,
                derecho.valor
            );

            triplos.push({
                numero: numero,
                operador: token,
                operando1: izquierdo.triplo,
                operando2: derecho.triplo
            });

            cuadruplos.push({
                numero: numero,
                operador: token,
                operando1: izquierdo.cuadruplo,
                operando2: derecho.cuadruplo,
                resultado: temporal
            });

            pila.push({
                triplo: '(' + numero + ')',
                cuadruplo: temporal,
                valor: valor
            });
        }
    });

    if (pila.length !== 1) {
        throw new Error('La expresin no es válida');
    }

    return {
        triplos: triplos,
        cuadruplos: cuadruplos,
        resultado: pila[0].valor,
        valorFinal: pila[0].cuadruplo,
        triploFinal: pila[0].triplo
    };
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
            throw new Error('Ingresa una operación matemática.');
        }

        const asignacion = texto.match(
            /^([a-zA-Z][a-zA-Z0-9]*)\s*=\s*(.+)$/
        );

        let variable = null;
        let operacion = texto;

        if (asignacion) {
            variable = asignacion[1];
            operacion = asignacion[2];
        }

        const tokens = obtenerTokens(operacion);
        const posfija = convertirPosfija(tokens);
        const datos = generarTablas(posfija);

        if (variable !== null) {
            const numero = datos.triplos.length;

            datos.triplos.push({
                numero: numero,
                operador: '=',
                operando1: datos.triploFinal,
                operando2: '-'
            });

            datos.cuadruplos.push({
                numero: numero,
                operador: '=',
                operando1: datos.valorFinal,
                operando2: '-',
                resultado: variable
            });
        }

        mostrarTablas(datos);

        if (datos.resultado !== null) {
            resultadoOperacion.innerHTML = datos.resultado;
        } else {
            resultadoOperacion.innerHTML =
                'No se puede calcular: faltan valores para las variables.';
        }

        Swal.fire({
            icon: 'success',
            title: 'Operacion realizada',
            text: 'Las tablas y el resultado están listos.',
            timer: 1800,
            showConfirmButton: false
        });

    } catch (error) {
        triplete.innerHTML = '';
        cuarteto.innerHTML = '';
        resultadoOperacion.innerHTML = 'Sin resultado';

        Swal.fire({
            icon: 'error',
            title: '¡Hay un problema!',
            text: error.message
        });
    }
});

barredora.addEventListener('click', () => {
    Swal.fire({
        icon: 'question',
        title: '¿Borrar expresion?',
        text: 'Se eliminan la expresin, el resultado y las tablas',
        showCancelButton: true,
        confirmButtonText: 'limpia',
        cancelButtonText: 'cancelar'
    }).then((respuesta) => {
        if (respuesta.isConfirmed) {
            expresion.value = '';
            triplete.innerHTML = '';
            cuarteto.innerHTML = '';
            resultadoOperacion.innerHTML = 'Esperando una operacion';

            expresion.focus();

            Swal.fire({
                icon: 'success',
                title: '¡Todo limpio!',
                timer: 1200,
                showConfirmButton: false
            });
        }
    });
});