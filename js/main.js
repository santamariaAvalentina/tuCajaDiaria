
/* FECHA */
let fecha = document.getElementById("fecha")
let hoy = new Date()
fecha.innerHTML = hoy.toLocaleDateString()

/* CAJA INICIAL EN EFECTIVO*/

let cajaInEfectivo = document.getElementById("cajaInicialEfectivo")
cajaInEfectivo.addEventListener("input", function(){
    localStorage.setItem("cajaEfectivo", cajaInEfectivo.value)
})
cajaInEfectivo.value = localStorage.getItem("cajaEfectivo")

/*CAJA INICIAL TRASFERENCIA*/
let cajaInTransferencia =document.getElementById("cajaInicialTransferencia")
cajaInTransferencia.addEventListener("input",function(){
    localStorage.setItem("cajaInTransf", cajaInTransferencia.value)
})
cajaInTransferencia.value =localStorage.getItem("cajaInTransf")
let botonCargar = document.getElementById("cargar")

botonCargar.addEventListener("click",function() {
    location.reload()

})

let descripcion = document.getElementById("descripcion")
let monto = document.getElementById("monto")
let tipoMovimiento = document.getElementById("seleccionarTipo")
let tipoMetodo = document.getElementById("seleccionarMetodo")
let agregar = document.getElementById("btnAgregar")
let movimientosArray =JSON.parse(localStorage.getItem("movimientos")) || []


fetch("./db/dataTipos.json")
    .then(respuesta => respuesta.json())
    .then(tipos => {
        tipos.forEach(tipo=>{
            let option=document.createElement("option")
            option.value = tipo.nombre
            option.innerHTML =tipo.nombre
            tipoMovimiento.appendChild(option)
        })
    })

fetch("./db/dataMetodos.json")
    .then(respuesta => respuesta.json())
    .then(metodos => {
        metodos.forEach(metodo=> {
            let option=document.createElement("option")
            option.value=metodo.nombre
            option.innerHTML =metodo.nombre
            tipoMetodo.appendChild(option)
        })
    })


let movimientos = document.getElementById("movimientos")

agregar.addEventListener("click",function() {
    let detalles = descripcion.value
    let montoIngresado = monto.value
    let movimiento = tipoMovimiento.value
    let metodo = tipoMetodo.value

    let nuevoMovimiento ={
        descripcion : detalles,
        monto : montoIngresado,
        tipoMovimiento : movimiento,
        metodoPago : metodo,
        hora: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    }
    if(detalles === "" || montoIngresado === "" || movimiento === "" || metodo === ""){
        Swal.fire({
            title: "Faltan completar!!!",
            text: "Completá todos los campos para agregar",
            icon: "error"
        })
        return
    }
    movimientosArray.push(nuevoMovimiento)
    localStorage.setItem("movimientos", JSON.stringify(movimientosArray))
    movimientosArray = JSON.parse(localStorage.getItem("movimientos")) || []
    renderMovimientos(movimientosArray)
    renderCierreEfectivo()
    renderCierreTransferencia()
    renderIngresos()
    renderSueldos()
    cierreTarjetas()
    Toastify({
        text: `${nuevoMovimiento.tipoMovimiento} AGREGADO/A!!!`,
        duration: 3000,
        gravity: "bottom", 
        position: "center",
        style: {
          background: "#28A745",
        },
      }).showToast();
    descripcion.value = ""
    monto.value = ""
    tipoMovimiento.value = ""
    tipoMetodo.value = ""
})
let listaMovimientos = document.getElementById("listaMovimientos")

function renderMovimientos(array){
    listaMovimientos.innerHTML = ""
    let ultimos10 =array.slice(-10)
    ultimos10.forEach((movimiento, index) => {
        let indexReal =array.length - ultimos10.length + index
        let color = ""
            if(movimiento.tipoMovimiento == "Venta" ){
                color = "venta"
            }
            else if(movimiento.tipoMovimiento == "Gasto" || movimiento.tipoMovimiento == "Sueldo"){
                color =  "gasto"
            }
            else{
                color = "ingreso"
            }
        let signo = ""
            if(movimiento.tipoMovimiento == "Gasto"|| movimiento.tipoMovimiento == "Sueldo"){
                signo = "-"
            }else{
                signo = "+"
            }
    
        let itemMovim =document.createElement("div")
        itemMovim.innerHTML = `<div class="renderMov">
                                   <h3 class="descripcionN">${movimiento.descripcion}</h3> 
                                    <h3 class=" descripcion"> ${movimiento.metodoPago}</h3>
                                    <h3 class=" ${color} "> ${signo} $${movimiento.monto}</h3>
                                    <h3 class=" hora">${movimiento.hora}</h3> 
                                    <button class=btnEliminar id="btn-eliminar-${index}">❌</button>  
                                </div>`

        listaMovimientos.appendChild(itemMovim)
        const btnEliminar =document.getElementById(`btn-eliminar-${index}`)
        btnEliminar.addEventListener("click", () =>{
            movimientosArray.splice(indexReal,1)
            localStorage.setItem("movimientos",JSON.stringify(movimientosArray))
            renderMovimientos(movimientosArray)
            renderCierreEfectivo()
            renderCierreTransferencia()
            renderIngresos()
            renderSueldos()
            cierreTarjetas()
            Toastify({
                text: `ELIMINADO`,
                duration: 3000,
                gravity: "bottom", 
                position: "center",
                style: {
                  background: "#f03a17",
                },
              }).showToast();
           
        })
        
    })
}
let cierreIngresos = document.getElementById ("cierreIngresos")
function renderIngresos(){
    let ingresosEfectivo = movimientosArray
        .filter(m => m.tipoMovimiento === "Ingreso" &&  m.metodoPago === "Efectivo" )
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    let ingresosTransf =movimientosArray
        .filter(m => m.tipoMovimiento === "Ingreso" && m.metodoPago === "Transferencia" )
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    
        let resumenIngreso = document.getElementById("resumenIngresos")
        resumenIngreso.innerHTML= `<div class="ventasFinales">
                                        <h3> Ingresos Efectivo : $ ${ingresosEfectivo}</h3>
                                        <h3> Ingresos Transferencia : $ ${ingresosTransf}</h3>
                                    </div>`
        return ingresosEfectivo + ingresosTransf
}

let sueldoFinal = document.getElementById("sueldos")
function renderSueldos(){
    let sueldo =movimientosArray
    .filter(m => m.tipoMovimiento === "Sueldo" &&  (m.metodoPago === "Efectivo" || m.metodoPago === "Transferencia") )
    .reduce((acum, m) => acum + parseFloat(m.monto), 0)

    let sueldosEmpleados =document.getElementById("sueldosDetallados")
    sueldosEmpleados.innerHTML = `<h3 class="ventasFinales"> $ ${sueldo} </h3>`     
    
    return sueldo 
}
let cierreEfectivo = document.getElementById("cierreEfectivo")
function renderCierreEfectivo(){
    let cajaInicial = parseFloat(localStorage.getItem("cajaEfectivo")) || 0
    
    let ventasEfectivo = movimientosArray
        .filter(m => m.metodoPago === "Efectivo" && m.tipoMovimiento === "Venta")
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    
    let gastosEfectivo = movimientosArray
        .filter(m => m.metodoPago === "Efectivo" && (m.tipoMovimiento === "Gasto" || m.tipoMovimiento === "Sueldo"))
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    let ingresosEfectivo = movimientosArray
        .filter(m => m.tipoMovimiento === "Ingreso" &&  m.metodoPago === "Efectivo" )
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    
    let cajaFinalEfect = cajaInicial + ventasEfectivo - gastosEfectivo + ingresosEfectivo

    let resumenEfectivo = document.getElementById("resumenEfectivo")
    resumenEfectivo.innerHTML = `<div class="ventasFinales">
                                    <h3>Caja inicial: $${cajaInicial}</h3>
                                    <h3>Ingresos: + $${ingresosEfectivo}</h3>
                                    <h3>Ventas: + $${ventasEfectivo}</h3>
                                    <h3>Gastos: - $${gastosEfectivo}</h3>
                                    <p>--------------------------</p>
                                    <h3>Caja final: $${cajaFinalEfect}</h3>
                                </div>`
    return cajaFinalEfect
}
let cierreTransferencia = document.getElementById ("cierreTransferencia")
function renderCierreTransferencia(){
    let cajaInicial = parseFloat(localStorage.getItem("cajaInTransf")) || 0
    
    let ventasTransf = movimientosArray
        .filter(m => m.metodoPago === "Transferencia" && m.tipoMovimiento === "Venta" )
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    
    let gastosTransf = movimientosArray
        .filter(m => m.metodoPago === "Transferencia" && (m.tipoMovimiento === "Gasto" || m.tipoMovimiento === "Sueldo"))
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    let ingresosTransf =movimientosArray
        .filter(m => m.tipoMovimiento === "Ingreso" && m.metodoPago === "Transferencia" )
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    
    let cajaFinalTransf = cajaInicial + ventasTransf - gastosTransf

    let resumenTransf = document.getElementById("resumenTransferencia")
    resumenTransf.innerHTML = `<div class="ventasFinales">
                                 <h3>Caja inicial: $${cajaInicial}</h3>
                                 <h3>Ingresos: + $${ingresosTransf}</h3>
                                 <h3>Ventas: + $${ventasTransf}</h3>
                                 <h3>Gastos: - $${gastosTransf}</h3>
                                 <p>-------------------------</p>
                                 <h3>Caja final: $${cajaFinalTransf}</h3>
                               </div>`
    return cajaFinalTransf
    
}
let cierreTarjeta = document.getElementById("cierreTarjeta")
function cierreTarjetas() {
    let ventasDebito = movimientosArray
        .filter (m => m.metodoPago === "Debito" )
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    let ventasCredito = movimientosArray
        .filter(m => m.metodoPago === "Credito")
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    let ventasQr = movimientosArray
        .filter (m => m.metodoPago === "Qr")
        .reduce((acum, m) => acum + parseFloat(m.monto), 0)
    let resumenTarj = document.getElementById("resumenTarjeta")
    resumenTarj.innerHTML = `<div class="ventasFinales">
                                <h3> Debitos: $${ventasDebito}</h3>
                                <h3> Creditos: $${ventasCredito}</h3>
                                <h3> Qr: $${ventasQr}</h3>
                            </div>`
    return ventasCredito + ventasDebito + ventasQr
}

let botonEnviar = document.getElementById("btnWhatsapp")

botonEnviar.addEventListener("click", function(){

    Swal.fire({
        title: "¿Cerras la caja?",
        text: "Se enviará el cierre por WhatsApp",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cerrar caja",
        cancelButtonText: "Cancelar"
    }).then((result) => {

        if(result.isConfirmed){

            let ventasEfectivo = movimientosArray
                .filter(m => m.metodoPago === "Efectivo" && m.tipoMovimiento === "Venta")
                .reduce((acum, m) => acum + parseFloat(m.monto), 0)

            let gastosEfectivo = movimientosArray
                .filter(m => m.metodoPago === "Efectivo" && m.tipoMovimiento === "Gasto")
                .reduce((acum, m) => acum + parseFloat(m.monto), 0)

            let ventasTransferencia = movimientosArray
                .filter(m => m.metodoPago === "Transferencia" && m.tipoMovimiento === "Venta")
                .reduce((acum, m) => acum + parseFloat(m.monto), 0)

            let gastosTransferencia = movimientosArray
                .filter(m => m.metodoPago === "Transferencia" && m.tipoMovimiento === "Gasto")
                .reduce((acum, m) => acum + parseFloat(m.monto), 0)

            let totalTarjetas = cierreTarjetas()
            let totalIngresos = renderIngresos()
            let totalSueldos = renderSueldos()

            let mensaje = `Cierre de caja del Dia: ${hoy.toLocaleDateString()}
            Gastos en efectivo: $${gastosEfectivo}
            Gastos transferencia: $${gastosTransferencia}
            Ventas con Tarjeta/QR: $${totalTarjetas}
            Ingresos a la caja: $${totalIngresos}
            Sueldos: $${totalSueldos}
            Ventas en efectivo: $${ventasEfectivo}
            Ventas transferencia: $${ventasTransferencia}`

            window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`)

            localStorage.removeItem("movimientos")
            localStorage.removeItem("cajaInTransf")
            localStorage.removeItem("cajaEfectivo")
            cajaInEfectivo.value = ""
            cajaInTransferencia.value = ""

            movimientosArray = []

            renderMovimientos(movimientosArray)
            renderCierreEfectivo()
            renderCierreTransferencia()
            renderIngresos()
            renderSueldos()
            cierreTarjetas()

            Swal.fire({
                title: "Caja cerrada",
                text: "El cierre fue realizaco con exito",
                icon: "success"
              })
        }
    })
})
renderSueldos()
renderMovimientos(movimientosArray)
renderCierreEfectivo()
renderCierreTransferencia()
renderIngresos()
cierreTarjetas()
