sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel",
      "sap/m/MessageBox",
      "sap/ui/core/routing/History",
      "sap/ui/core/Fragment",
    ],
    function (Controller, JSONModel, MessageBox, History, Fragment) {
      "use strict";
      var URL_MAIN = "https://tlmservice.cfapps.us10.hana.ondemand.com";
      var URL_AUTH = "http://localhost:8080/api/auth";
      var auth = false;
      var runouttime = false;
      var consolerErrors = true;
      return Controller.extend("estandar.csti.controller.BaseController", {
        getURL: function () {
          return URL_MAIN;
        },
        getRequest: function (endpoint, component, callback, errCallback) {
          component =
            component === null || component === undefined ? null : component;
          callback =
            callback === null || callback === undefined ? null : callback;
          errCallback =
            errCallback === null || errCallback === undefined
              ? false
              : errCallback;
          if (component !== null) {
            component.setBusy(true);
          }
          var settings = {
            method: "GET",
          };
          var headers = {
            "Content-Type": "application/json",
          };
          if (auth) {
            headers["Authorization"] = localStorage.getItem(
              "interacterjwthashcode"
            );
          }
          settings.headers = new Headers(headers);
          fetch(URL_MAIN + endpoint, settings)
            .then((res) => {
              if (res.ok) {
                return res.json();
              } else {
                throw Error([res.status, res.headers, res.body]);
              }
            })
            .then((data) => {
              if (component !== null) {
                component.setModel(new JSONModel(data));
                component.setBusy(false);
              }
              if (callback !== null) {
                callback(data);
              }
            })
            .catch((e) => {
              if (errCallback) {
                errCallback(e);
              } else {
                MessageBox.error(
                  "Error no controlador por favor comunicar al administrador del sistema"
                );
                if (consolerErrors) {
                  console.log(e);
                  //insertar log Errors
                }
              }
            });
        },
        postRequest: function (endpoint, body, component, callback, errCallback) {
          component =
            component === null || component === undefined ? null : component;
          callback =
            callback === null || callback === undefined ? null : callback;
          errCallback =
            errCallback === null || errCallback === undefined
              ? false
              : errCallback;
          var settings = {
            method: "POST",
            body: JSON.stringify(body),
          };
          var headers = {
            "content-type": "application/json",
          };
          if (auth) {
            headers["Authorization"] = localStorage.getItem(
              "interacterjwthashcode"
            );
          }
          settings.headers = new Headers(headers);
          fetch(URL_MAIN + endpoint, settings)
            .then((res) => {
              if (res.ok) {
                return res.json();
              } else {
                throw Error([res.status, res.headers, res.body]);
              }
            })
            .then((data) => {
              if (component !== null) {
                component.setModel(new JSONModel(data));
              }
              if (callback !== null) {
                callback(data);
              }
            })
            .catch((e) => {
              if (errCallback) {
                errCallback(e);
              } else {
                MessageBox.error(
                  "Error no controllador por favor comunicar al administrador del sitema"
                );
                if (consolerErrors) {
                  console.log(JSON.parse(e));
                  //insertar log Errors
                }
              }
            });
        },
        //TODO
        deleteRequest: function () {},
        //TODO
        updateRequest: function (
          endpoint,
          body,
          component,
          callback,
          errCallback
        ) {
          component =
            component === null || component === undefined ? null : component;
          callback =
            callback === null || callback === undefined ? null : callback;
          errCallback =
            errCallback === null || errCallback === undefined
              ? false
              : errCallback;
          var settings = {
            method: "PUT",
            body: JSON.stringify(body),
          };
          var headers = {
            "content-type": "application/json",
          };
          if (auth) {
            headers["Authorization"] = localStorage.getItem(
              "interacterjwthashcode"
            );
          }
          settings.headers = new Headers(headers);
          fetch(URL_MAIN + endpoint, settings)
            .then((res) => {
              if (res.ok) {
                return res.json();
              } else {
                throw Error([res.status, res.headers, res.body]);
              }
            })
            .then((data) => {
              if (component !== null) {
                component.setModel(new JSONModel(data));
              }
              if (callback !== null) {
                callback(data);
              }
            })
            .catch((e) => {
              if (errCallback) {
                errCallback(e);
              } else {
                MessageBox.error(
                  "Error no controllador por favor comunicar al administrador del sitema"
                );
                if (consolerErrors) {
                  console.log(JSON.parse(e));
                  //insertar log Errors
                }
              }
            });
        },
        getAuthorization: function (credentials, callback) {
          fetch(URL_AUTH, {
            method: "POST",
            headers: new Headers({
              "Content-Type": "application/json",
            }),
            body: JSON.stringify(credentials),
          })
            .then((res) => {
              if (res.ok) {
                return res.json();
              } else {
                throw Error([res.status, res.headers, res.body]);
              }
            })
            .then((token) => {
              localStorage.setItem("interacterjwthashcode", token.token);
              if (callback !== null) {
                callback(token);
              }
            })
            .catch((e) => {
              MessageBox.error(
                "Error al verificar tu identidad en el sistema por favor verifica el tus credenciales"
              );
              if (consolerErrors) {
                console.log(e);
                //insertar log Errors
              }
            });
        },
        getAuthorizationSync: async function (credentials, callback) {
          try {
            var res = await fetch(URL_AUTH, {
              method: "POST",
              headers: new Headers({
                "Content-Type": "application/json",
              }),
              body: JSON.stringify(credentials),
            });
            var token = null;
            if (res.ok) {
              token = await res.json();
              localStorage.setItem("interacterjwthashcode", token.token);
              if (callback !== null) {
                callback(token);
              }
            } else {
              throw Error(res.status);
            }
          } catch (e) {
            MessageBox.error(
              "Error al verificar tu identidad en el sistema por favor verifica el tus credenciales"
            );
            if (consolerErrors) {
              console.log(e);
              //insertar log Errors
            }
          }
        },
        goBot: function (path) {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo(path);
        },
        navBack: function () {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();
  
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("main", true);
          }
        },
        adder: function (modelName, jsonCombo, update, rowData) {
          var modelosData = this.getOwnerComponent()
            .getModel("models_config")
            .getData();
          var modelo = modelosData[modelName];
          var idDialog = modelName + "_dialogo";
          var HBoxContenedor = new sap.m.HBox({
            width: "100%",
            justifyContent: "Center",
          });
          var VBoxContenedor = new sap.m.VBox({
            width: "80%",
          });
          if (this[idDialog]) {
            var content = this[idDialog].getContent()[0].getItems()[0].getItems();
            for (var i = 1; i < content.length; i = i + 2) {
              var componentType = content[i].getMetadata().getName();
              console.log(componentType);
              switch (componentType) {
                case "sap.m.Input":
                  content[i].setValue(null);
                  break;
                case "sap.m.ComboBox":
                  content[i].setSelectedItem(null);
                  break;
                case "sap.m.DatePicker":
                  content[i].setValue(null);
                  break;
              }
            }
            console.log(content);
            this[idDialog].open();
          } else {
            Object.keys(modelo.model).forEach((key) => {
              if (modelo.validation[key].use !== false) {
                if (
                  modelo.model[key] === "string" ||
                  modelo.model[key] === "int"
                ) {
                  VBoxContenedor.addItem(
                    new sap.m.Text(`${idDialog}_label_${key}`, {
                      text: modelo.labels[key],
                    }).addStyleClass(
                      "sapUiTinyMarginTop sapUiTinyMarginBegin sapUiTinyMarginEnd"
                    )
                  );
                  VBoxContenedor.addItem(
                    new sap.m.Input(`${idDialog}_${key}`, {
                      type: modelo.model[key] === "string" ? "Text" : "Number",
                      maxLength: modelo.validation[key].size,
                    }).addStyleClass("sapUiTinyMargin")
                  );
                } else if (modelo.model[key] === "object") {
                  if (jsonCombo !== undefined && jsonCombo !== null) {
                    if (jsonCombo[key] !== undefined && jsonCombo[key] !== null) {
                      VBoxContenedor.addItem(
                        new sap.m.Text(`${idDialog}_label_${key}`, {
                          text: modelo.labels[key],
                        }).addStyleClass(
                          "sapUiTinyMarginTop sapUiTinyMarginBegin sapUiTinyMarginEnd"
                        )
                      );
                      var info = "{id}";
                      if (
                        jsonCombo[key].info !== null &&
                        jsonCombo[key].info !== undefined
                      ) {
                        info = jsonCombo[key].info;
                      }
                      var template = new sap.ui.core.Item({
                        text: info,
                        key: "{id}",
                      });
                      var combo = new sap.m.ComboBox(`${idDialog}_${key}`, {
                        placeholder: modelo.labels[key],
                        items: {
                          path: "/",
                          template: template,
                        },
                      });
                      combo.setModel(new JSONModel(jsonCombo[key].data));
                      combo.addStyleClass(
                        "sapUiTinyMarginTop sapUiTinyMarginBegin sapUiTinyMarginEnd"
                      );
  
                      VBoxContenedor.addItem(combo);
                    }
                  }
                } else if (modelo.model[key] === "date") {
                  VBoxContenedor.addItem(
                    new sap.m.Text(`${idDialog}_label_${key}`, {
                      text: modelo.labels[key],
                    }).addStyleClass(
                      "sapUiTinyMarginTop sapUiTinyMarginBegin sapUiTinyMarginEnd"
                    )
                  );
                  var datepicker = new sap.m.DatePicker(`${idDialog}_${key}`, {
                    displayFormat: modelo.validation[key].format,
                    valueFormat: modelo.validation[key].format,
                  }).addStyleClass(
                    "sapUiTinyMarginTop sapUiTinyMarginBegin sapUiTinyMarginEnd"
                  );
                  VBoxContenedor.addItem(datepicker);
                }
              }
            });
            HBoxContenedor.addItem(VBoxContenedor);
            var that = this;
            var oDialog = new sap.m.Dialog(idDialog, {
              title: modelName.toUpperCase(),
              contentWidth: "auto",
              content: HBoxContenedor,
              buttons: [
                new sap.m.Button({
                  text: "Aceptar",
                  press: function (oEvent) {
                    that.saveRegister(oEvent, "add");
                  },
                }),
                new sap.m.Button({
                  text: "Cancelar",
                  press: function () {
                    that[idDialog].close();
                  },
                }),
              ],
            });
            this[idDialog] = oDialog;
            oDialog.open();
          }
        },
        saveRegister: function (event, tipo) {
          console.log(event);
          console.log(tipo);
        },
        dateFormatter: function (date) {
          if (date === undefined || date === null) {
            var fecha = new Date();
          } else {
            var fecha = new Date(date);
          }
          var dia =
            fecha.getDate() >= 10 ? fecha.getDate() : "0" + fecha.getDate();
          var mes =
            fecha.getMonth() + 1 >= 10
              ? fecha.getMonth() + 1
              : "0" + (fecha.getMonth() + 1);
          var año = fecha.getFullYear();
          return `${dia}-${mes}-${año}`;
        },
        dateTimeFormatter: function (date) {
          if (date === undefined || date === null) {
            var fecha = new Date();
          } else if(date.toString().includes(".")){
            var fecha = new Date(date.split(".")[0]);
          }
          else{
            var fecha = new Date(date);
          }
          var dia =
            fecha.getDate() >= 10 ? fecha.getDate() : "0" + fecha.getDate();
          var mes =
            fecha.getMonth() + 1 >= 10
              ? fecha.getMonth() + 1
              : "0" + (fecha.getMonth() + 1);
          var año = fecha.getFullYear();
          var hora =
            fecha.getHours() >= 10 ? fecha.getHours() : "0" + fecha.getHours();
          var minutos =
            fecha.getMinutes() >= 10
              ? fecha.getMinutes()
              : "0" + fecha.getMinutes();
          var ampm = fecha.getHours() >= 12 ? "pm" : "am";
          return `${dia}-${mes}-${año} ${hora}:${minutos} ${ampm}`;
        },
        searchDateFormatter: function (date) {
          if (date === undefined || date === null) {
            var fecha = new Date();
          } else {
            var fecha = new Date(date);
          }
          var dia =
            fecha.getDate() >= 10 ? fecha.getDate() : "0" + fecha.getDate();
          var mes =
            fecha.getMonth() + 1 >= 10
              ? fecha.getMonth() + 1
              : "0" + (fecha.getMonth() + 1);
          var año = fecha.getFullYear();
          return `${año}-${mes}-${dia}`;
        },
        dateTimeDBFormatter: function (date) {
          if (date === undefined || date === null) {
            var fecha = new Date();
          }
          else {
            
            var fecha = new Date(date);
          }
          var dia =
            fecha.getDate() >= 10 ? fecha.getDate() : "0" + fecha.getDate();
          var mes =
            fecha.getMonth() + 1 >= 10
              ? fecha.getMonth() + 1
              : "0" + (fecha.getMonth() + 1);
          var año = fecha.getFullYear();
          var hora =
            fecha.getHours() >= 10 ? fecha.getHours() : "0" + fecha.getHours();
          var minutos =
            fecha.getMinutes() >= 10
              ? fecha.getMinutes()
              : "0" + fecha.getMinutes();
          var segundos =
            fecha.getSeconds() >= 10
              ? fecha.getSeconds()
              : "0" + fecha.getSeconds();
          return `${año}-${mes}-${dia}T${hora}:${minutos}:${segundos}`;
        },
        dateAppointFormatter: function (date) {
          var fecha = new Date(date);
          var año = fecha.getFullYear().toString();
          var mes = fecha.getMonth().toString();
          var dia =
            fecha.getDate() >= 10 ? fecha.getDate() : "0" + fecha.getDate();
          dia = dia.toString();
          return new Date(año, mes, dia);
        },
      });
    }
  );
  