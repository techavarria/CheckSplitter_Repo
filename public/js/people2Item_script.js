// VARIABLES
var subtotal = 0;
var localItems = JSON.parse(localStorage.getItem('localItems'));
var localPeople = JSON.parse(localStorage.getItem('localPeople'));
var totales_dic = JSON.parse(localStorage.getItem('localTotales'));

localStorage.setItem('localDirPer', JSON.stringify({}));
var ItemDiccJ = {};
var cant_peopleChecked = 0;

// FUNCIONES
startItemDiccJ();
CheckPeople();
CheckItems();
actualizarChecks();

function startItemDiccJ() { // crea diccionario de items con personas por cada item
  for (i = 0; i < Object.keys(localItems).length; i++) {
    if (localItems[Object.keys(localItems)[i]][0] > 1) {
      for (j = 1; j < localItems[Object.keys(localItems)[i]][0] + 1; j++) {
        nameItem = Object.keys(localItems)[i];
        ItemDiccJ[nameItem.concat(j)] = localItems[Object.keys(localItems)[i]][1] / localItems[Object.keys(localItems)[i]][0];
      }
    } else {
      ItemDiccJ[Object.keys(localItems)[i]] = localItems[Object.keys(localItems)[i]][1];
    }
  }

  for (i = 0; i < Object.keys(ItemDiccJ).length; i++) {
    pricevec = (ItemDiccJ[Object.keys(ItemDiccJ)[i]]);
    ItemDiccJ[Object.keys(ItemDiccJ)[i]] = {
      "valor": pricevec,
      "people": {}
    };
  }
}

function CheckPeople() { // crea lista de checkboxs con los nombres de las personas
  d1 = document.getElementById('people');
  for (i = 0; i < Object.keys(localPeople).length; i++) {
    namePeople = Object.keys(localPeople)[i];
    html_code = `
            <div class="input-group mb-3">
                <div class="input-group-prepend">
                    <input type="checkbox" class="form-check-input" id="idCheck_${i}" onchange="peopleChecked(this)" name="${namePeople}">
                    <span class="input-group-text" id="inputGroup-sizing-default">${namePeople}</span>
                </div>
                <input type="text" name="porcentaje" class="form-control texts" value="" id="idText_${i}" size="4" disabled>
            </div>
            `;
    d1.insertAdjacentHTML('beforeend', html_code);
  }
}

function CheckItems() { // crea listbox con los items
  d1 = document.getElementById('items');
  for (i = 0; i < Object.keys(ItemDiccJ).length; i++) {
    nameItem = Object.keys(ItemDiccJ)[i];
    html_code = `<option id="opciones" value="${nameItem}">${nameItem}</option>`;
    d1.insertAdjacentHTML('beforeend', html_code);
  }
}

function peopleChecked(element) { // activa el campo del porcentaje de una persona, si se checkea su nombre
  numero_persona = element.id.split("_").slice(-1);
  id_texto = "idText_" + numero_persona;
  d1 = document.getElementById(id_texto);
  if (element.checked) {
    document.getElementById(id_texto).disabled = false;
    cant_peopleChecked++;
    d1.value = 100 / cant_peopleChecked;
  } else {
    d1.value = null;
    document.getElementById(id_texto).disabled = true;
    cant_peopleChecked--;
  }
  //  ciclo que cambie los porcentajes
  for (i = 0; i < Object.keys(localPeople).length; i++) {
    id_check = "idCheck_" + i;
    if (document.getElementById(id_check).checked) {
      id_texto = "idText_" + i;
      d1 = document.getElementById(id_texto);
      d1.value = 100 / cant_peopleChecked;
    }
  }
}

function actualizarChecks() { // activa los checkboxs de las personas que corresponden al item que sale en el listbox de items
  x = document.getElementsByClassName("form-check-input")
  y = document.getElementsByClassName("texts")
  for (var i = 0; i < x.length; i++) {
    x[i].checked = false;
  }
  for (var i = 0; i < y.length; i++) {
    y[i].disabled = true;
    y[i].value = null;
  }
  select = document.getElementById("items");
  Producto = select.options[select.selectedIndex].value;
  dicAux = ItemDiccJ[Producto]["people"];
  peop = Object.keys(dicAux);
  porcen = Object.values(dicAux);
  for (var i = 0; i < peop.length; i++) {
    document.getElementsByName(peop[i])[0].checked = true;
    theID = document.getElementsByName(peop[i])[0].id;

    numero_persona = theID.split("_").slice(-1);
    id_porc = "idText_" + numero_persona;
    document.getElementById(id_porc).value = porcen[i];
    document.getElementById(id_porc).disabled = false;
  }
}

function checkboxlist() { // crea un diccionario con las personas y para cada persona los items que le corresponden, con su valor y porcentaje y el total a pagar
  DirPer = localPeople;
  faltan_items = 0
  porc_valido = 1
  for (i = 0; i < Object.keys(localPeople).length; i++) { //Por personas
    namePeople = Object.keys(localPeople)[i];
    AuxDic = {};
    for (j = 0; j < Object.keys(ItemDiccJ).length; j++) { //Por items
      nameProduct = Object.keys(ItemDiccJ)[j];
      ProdPrice = Object.values(ItemDiccJ)[j]["valor"];
      PeoDic = Object.values(ItemDiccJ)[j]["people"];
      if (Object.keys(PeoDic).length == 0) {
        faltan_items = 1;
      }
      for (k = 0; k < Object.keys(PeoDic).length; k++) { //Por personas de ese item
        NomPorProd = Object.keys(PeoDic)[k];
        PercPorProd = Object.values(PeoDic)[k];
        if (PercPorProd < 0 || PercPorProd > 100) {
          porc_valido = 0
        }
        if (namePeople == NomPorProd) {
          ico = ProdPrice - ProdPrice / 1.08; // lo cambie
          neto = ProdPrice - ico;
          propina = neto * 0.1;
          totalProducto = ProdPrice + propina;
          AuxDic[nameProduct] = {
            "valor": (PercPorProd * totalProducto) / 100,
            "porcentaje": PercPorProd
          }
          DirPer[namePeople] = {
            "items": AuxDic,
            "total": 0
          };
        }
      }
    }
  }

  // Poner ejemplo
  localStorage.setItem('localDirPer', JSON.stringify(DirPer));
  if (faltan_items == 1) {
    alert('Escoja personas para todos los items para poder continuar!')
  } else {
    if (porc_valido == 0) {
      alert('Hay algun porcentaje no valio')
    } else {
      SumaPorce_valida = true;
      revisar_porcentajes();
      if (SumaPorce_valida) {
        location.replace('item_per_person.html');
      } else {
        alert('Haga que los porcentajes sumen el 100%')
      }
    }
  }
  localStorage.setItem('localItemDiccJ', JSON.stringify(ItemDiccJ));
}

function back() { // se devuelve a la pagina anterior
  location.replace('check.html');
}

// JQUERY
$(document).ready(function() { // detecta cuando hay un cambio en los checkboxs de las personas y actualiza el diccionario de las personas por item
  $("input").change(function() {
    var idChanged = event.target.id;
    var select = document.getElementById("items");
    var Producto = select.options[select.selectedIndex].value;


    // actualizar el json con los valores de los input
    for (i = 0; i < Object.keys(localPeople).length; i++) {
      numero_persona = i;
      id_ofCheck = "idCheck_" + numero_persona;
      id_ofPerc = "idText_" + numero_persona;
      var Porcentaje = document.getElementById(id_ofPerc).value;
      Persona = document.getElementById(id_ofCheck).name;

      if (Porcentaje < 0 || Porcentaje > 100) {
        alert('Escriba un valor valido');
      } else if (Porcentaje == 0) {
        delete ItemDiccJ[Producto]["people"][Persona];
      } else {
        ItemDiccJ[Producto]["people"][Persona] = Porcentaje;
      }
    }





    // if (idChanged.indexOf("Text") >= 0) { // si se cambio el porcentaje
    //     var Porcentaje = document.getElementById(idChanged).value;
    //
    //     numero_persona = idChanged.split("_").slice(-1);
    //     id_persona = "idCheck_" + numero_persona;
    //     Persona = document.getElementById(id_persona).name;
    //     ItemDiccJ[Producto]["people"][Persona] = Porcentaje;
    //
    //     if (Porcentaje < 0 || Porcentaje > 100) {
    //       alert('Escriba un valor valido');
    //     }
    // } else {
    //     numero_persona = idChanged.split("_").slice(-1);
    //     id_persona = "idCheck_" + numero_persona;
    //     Persona = document.getElementById(id_persona).name;
    //     ItemDiccJ[Producto]["people"][Persona] = 100/cant_peopleChecked;
    // }

  });
});

$(".form-control.one").change(function() { // atualiza las perfonas cuando se cambia de item en la listbox
  cant_peopleChecked = 0;
  actualizarChecks();
});

function revisar_porcentajes() {
  for (i = 0; i < Object.keys(ItemDiccJ).length; i++) { //Por item
    SumaPorce = 0;
    item = Object.keys(ItemDiccJ)[i];
    Dic_item = ItemDiccJ[item]
    Dic_per_item = Dic_item["people"]
    long_dic_per_item = Object.keys(Dic_per_item).length
    for (j = 0; j < long_dic_per_item; j++) {
      SumaPorce = parseFloat(Object.values(Dic_per_item)[j]) + SumaPorce;
    }
    if (SumaPorce != 100) {
      SumaPorce_valida = false;
    }
  }
}









//
