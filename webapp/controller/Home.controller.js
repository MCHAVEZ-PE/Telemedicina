sap.ui.define([
	"./BaseController",
"sap/m/MessageBox",
"sap/ui/core/routing/History",
"sap/ui/core/format/DateFormat",
"sap/ui/model/json/JSONModel",
"sap/ui/core/Fragment",
"sap/ui/unified/library",
"sap/ui/Device",
"sap/m/MessageToast"
], function(BaseController, MessageBox, History,DateFormat,JSONModel,Fragment,
	unifiedLibrary,Device,MessageToast) {
	"use strict";
	var CalendarDayType = unifiedLibrary.CalendarDayType;
	return BaseController.extend("com.csti.controller.Home", {
		 
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Home");
				var model = new JSONModel({});
				//modo de union con el model
				// model.setDefaultBindingMode("OneWay");
				this.getView().setModel(model,"device");
			// this.oRouter.getTarget("Page1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.llenarTabla();
			//calendar
			var oModel = new JSONModel();
			oModel.setData({
				startDate: new Date(),
				appointments: [{
					title: "Cita con Mauricio Chavez",
					type: CalendarDayType.Type01,
					startDate: new Date("2020", "3", "1", "5", "0"),
					endDate: new Date("2020", "3", "1", "6", "0")
				},
				{
					title: "Examen Medico  con Luis Miguel",	
					type: CalendarDayType.Type01,
					startDate: new Date("2020", "3", "1", "7", "0"),
					endDate: new Date("2020", "3", "1", "8", "0")
				},{
					title: "Revision de Análisis  con Jose Carlos",
					type: CalendarDayType.Type01,
					startDate: new Date("2020", "3", "4", "5", "0"),
					endDate: new Date("2020", "3", "4", "6", "0")
				},{
					title: "Cita con Luis Felipe",
					type: CalendarDayType.Type01,
					startDate: new Date("2020", "3", "10", "5", "0"),
					endDate: new Date("2020", "3", "10", "6", "0")
				}
			],
			supportedAppointmentItems: [
				{
					text: "Team Meeting",
					type: CalendarDayType.Type01
				},
				{
					text: "Personal",
					type: CalendarDayType.Type05
				},
				{
					text: "Discussions",
					type: CalendarDayType.Type08
				},
				{
					text: "Out of office",
					type: CalendarDayType.Type09
				},
				{
					text: "Private meeting",
					type: CalendarDayType.Type03
				}
			]
			});
		
			this.getView().setModel(oModel);
			// console.log(this.getView().getModel())

			oModel = new JSONModel();
			oModel.setData({allDay: false});
			this.getView().setModel(oModel, "allDay");
			
			// oModel = new JSONModel();
			// oModel.setData({ stickyMode: "None", enableAppointmentsDragAndDrop: true, enableAppointmentsResize: true, enableAppointmentsCreate: true });
			// this.getView().setModel(oModel, "settings");
			// this.oRouter.getRoute("Home").attachDisplay(jQuery.proxy(this.configurationInit,this));
			this.oRouter.getRoute("Home").attachPatternMatched(this.configurationInit,this);
		
		},
		configurationInit:function(){
			this.callServiceOfData();
		},
		callServiceOfData:function(){
			var oView= this.getView();
			var consultaObj = {
				estado: "1",
				idDoctorDisponibilidad: {
					idDoctor: {
					correo: "alobaton@csticorp.biz",
					},
				},
				idEstadoCita: {
					id: 1,
					nombre: "Pendiente",
					estado: "1",
					fechaActualizacion: null,
					fechaRegistro: "2020-04-05T17:13:30.447+0000",
					usuarioRegistro: null,
					usuarioActualizador: null,
					idSet: true,
				},
				};
				var modeloData = null;
				this.postRequest(
					"/api/citas/find",
					consultaObj,
					null,
					(result)=>{
						console.log(result)
						this.getOwnerComponent().setModel(new JSONModel(result),"citaData");
					}
				)
		
		},
		goingSala: function(){
			if(this.getView().getModel("citaData") === null || undefined ){
				this.callServiceOfData();
			}
			this.oRouter.navTo("Detalle");

		},
		onAfterRendering: function(){
				// console.log(Device.system.phone);
				var oView =this.getView();
				(Device.system.phone) ? oView.byId("boxTelemedicina").addStyleClass("direcTelemedicina") 
										: oView.byId("boxTelemedicina").removeStyleClass("direcTelemedicina");
		},
		onRowPress: function(){
			this.oRouter.navTo("Detalle")
		},
		llenarTabla: function(){
			var tablaPaciente = this.getView().byId("tablePacientes");
			var tablaPacientes1 = this.getView().byId("tablePacientes1");
			var tablaPacientes2 = this.getView().byId("tablePacientes2");
			
		
			this.getView().setModel(new JSONModel(jQuery.sap.getModulePath("com.csti.data","/data.json")),"modeloCliente");

			var mod = this.getView().getModel("modeloCliente")
			mod.attachRequestCompleted(null,()=>{
				// console.log( typeof mod.getData());
				tablaPaciente.setModel(mod);
				// tablaPacientes1.setModel(mod);
				tablaPacientes2.setModel(mod);
				
			})		
	

		},
		//calendar
		agregarPaciente: function(){
			MessageBox.show("Deseas agregar los pacientes a tu registro",{
				title:"Comfirmacion",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose:(sAction)=>{
					if(sAction ==="YES"){
						this.alterTabla()
					}
					// console.log(sAction);
				}
			  })


			},
		alterTabla:function(){

			var d = this.getView().getModel("modeloCliente");
			var t = this.getView().byId("tablePacientes1");

			var context = t.getSelectedContexts();
			var items = context.map(function(c) {
				d.getData().combined.telemedicina.push(c.getObject());
				
				return c.getObject();
			  });

			  d.updateBindings();
			 if(items.length!=0){
			  var objeto = [],
			  	atenciones= [];
			  var atenciones = d.getData().combined.atenciones;
			  //   console.log(items.length);
			  
			  for (let i = 0; i < items.length; i++) {
				  var id = items[i].ID;
				  
				  atenciones.forEach(element => {
					  if(element.ID!=id){
						  objeto.push(element);
						}
					});
					
				}
				atenciones = [...objeto]
				var a = this.getView().getModel("modeloCliente").getData();
				a.combined.atenciones = atenciones;
				d.updateBindings();		
			}
			else{
				MessageToast.show("Debes seleccionar almenos un registro ")
			}
		},
		
		// _getDefaultAppointmentStartHour: function() {
		// 	return 19;
		// },

		// _getDefaultAppointmentEndHour: function() {
		// 	return 20;
		// },

		crearCita: function(){
			this._crearDialog(this.getView().byId("SPC1").getStartDate());	
		},

		setFechaActual: function (oEvent) {
			this._crearDialog(oEvent.getParameter("date"));
		},
		
		_crearDialog: function(date){
			var oStartDate = new Date(date),
				oEndDate = new Date(oStartDate);

			// oStartDate.setHours(this._getDefaultAppointmentStartHour());
			// oEndDate.setHours(this._getDefaultAppointmentEndHour());

			// this._oChosenDayData = {start: oStartDate, end: oEndDate };
			console.log(this.getView().getModel())
			this.sPath = null;

			this.triggerDialogFragment("Crear Cita");
		},
		triggerDialogFragment: function (sTitle) {
			if (!this._oNewAppointmentDialog) {
				Fragment.load({
					id: "dialogFrag",
					name: "com.csti.Fragment.Cita",
					controller: this
				})
					.then(function(oDialog){
						this._oNewAppointmentDialog = oDialog;
						this.getView().addDependent(this._oNewAppointmentDialog);
						this._arrangeDialog(sTitle);
					}.bind(this));
			} else {
				this._arrangeDialog(sTitle);
			}
		},
		_arrangeDialog: function (sTitle) {
			// this._setValuesToDialogContent();
			this._oNewAppointmentDialog.setTitle(sTitle);
			this._oNewAppointmentDialog.open();
		},
		// _setValuesToDialogContent: function () {
		// 	var oAllDayAppointment = (Fragment.byId("dialogFrag", "allDay")),
		// 		sStartDatePickerID = oAllDayAppointment.getSelected() ? "DPStartDate" : "DTPStartDate",
		// 		sEndDatePickerID = oAllDayAppointment.getSelected() ? "DPEndDate" : "DTPEndDate",
		// 		oTitleControl = Fragment.byId("dialogFrag", "appTitle"),
		// 		oTextControl = Fragment.byId("dialogFrag", "moreInfo"),
		// 		oTypeControl = Fragment.byId("dialogFrag", "appType"),
		// 		oStartDateControl = Fragment.byId("dialogFrag", sStartDatePickerID),
		// 		oEndDateControl = Fragment.byId("dialogFrag", sEndDatePickerID),
		// 		oEmptyError = {errorState:false, errorMessage: ""},
		// 		oContext,
		// 		oContextObject,
		// 		oSPCStartDate,
		// 		sTitle,
		// 		sText,
		// 		oStartDate,
		// 		oEndDate,
		// 		sType;


		// 	if (this.sPath) {
		// 		oContext = this._oDetailsPopover.getBindingContext();
		// 		oContextObject = oContext.getObject();
		// 		sTitle = oContextObject.title;
		// 		sText = oContextObject.text;
		// 		oStartDate = oContextObject.startDate;
		// 		oEndDate = oContextObject.endDate;
		// 		sType = oContextObject.type;
		// 	} else {
		// 		sTitle = "";
		// 		sText = "";
		// 		if (this._oChosenDayData) {
		// 			oStartDate = this._oChosenDayData.start;
		// 			oEndDate = this._oChosenDayData.end;

		// 			delete this._oChosenDayData;
		// 		} else {
		// 			oSPCStartDate = this.getView().byId("SPC1").getStartDate();
		// 			oStartDate = new Date(oSPCStartDate);
		// 			oStartDate.setHours(this._getDefaultAppointmentStartHour());
		// 			oEndDate = new Date(oSPCStartDate);
		// 			oEndDate.setHours(this._getDefaultAppointmentEndHour());
		// 		}
		// 		oAllDayAppointment.setSelected(false);
		// 		sType = "Type01";
		// 	}

		// 	oTitleControl.setValue(sTitle);
		// 	oTextControl.setValue(sText);
		// 	oStartDateControl.setDateValue(oStartDate);
		// 	oEndDateControl.setDateValue(oEndDate);
		// 	oTypeControl.setSelectedKey(sType);
		// 	this._setDateValueState(oStartDateControl, oEmptyError);
		// 	this._setDateValueState(oEndDateControl, oEmptyError);
		// 	this.updateButtonEnabledState(oStartDateControl, oEndDateControl, this._oNewAppointmentDialog.getBeginButton());
		// },
		

		// updateButtonEnabledState: function (oDateTimePickerStart, oDateTimePickerEnd, oButton) {
		// 	var bEnabled = oDateTimePickerStart.getValueState() !== "Error"
		// 		&& oDateTimePickerStart.getValue() !== ""
		// 		&& oDateTimePickerEnd.getValue() !== ""
		// 		&& oDateTimePickerEnd.getValueState() !== "Error";

		// 	oButton.setEnabled(bEnabled);
		// },
	
		// handleMoreLinkPress: function(oEvent) {
		// 	var oDate = oEvent.getParameter("date"),
		// 		oSinglePlanningCalendar = this.getView().byId("SPC1");

		// 	oSinglePlanningCalendar.setSelectedView(oSinglePlanningCalendar.getViews()[2]); // DayView

		// 	this.getView().getModel().setData({ startDate: oDate }, true);
		// },


		_setDateValueState: function(oPicker, oErrorState) {
			if (oErrorState.errorState) {
				oPicker.setValueState("Error");
				oPicker.setValueStateText(oErrorState.errorMessage);
			} else {
				oPicker.setValueState("None");
			}
		}, 

		cancelarDialog:function(){
			Fragment.byId("dialogFrag","appTitle").setValue("");
			Fragment.byId("dialogFrag","moreInfo").setValue("");
			
			
			this._oNewAppointmentDialog.close();
		},
		handleDialogOkButton: function () {
			var bAllDayAppointment = (Fragment.byId("dialogFrag", "allDay")).getSelected(),
				sStartDate = bAllDayAppointment ? "DPStartDate" : "DTPStartDate",
				sEndDate = bAllDayAppointment ? "DPEndDate" : "DTPEndDate",
				sTitle = Fragment.byId("dialogFrag", "appTitle").getValue(),
				sText = Fragment.byId("dialogFrag", "moreInfo").getValue(),
				// sType = (Fragment.byId("dialogFrag", "appType").getSelectedItem().getKey())?'02':'02',
				sType = CalendarDayType.Type01,
				oStartDate = Fragment.byId("dialogFrag", sStartDate).getDateValue(),
				oEndDate = Fragment.byId("dialogFrag", sEndDate).getDateValue(),
				oModel = this.getView().getModel(),
				sAppointmentPath;

			if (Fragment.byId("dialogFrag", sStartDate).getValueState() !== "Error"
				&& Fragment.byId("dialogFrag", sEndDate).getValueState() !== "Error") {

				if (this.sPath) {
					sAppointmentPath = this.sPath;
					oModel.setProperty(sAppointmentPath + "/title", sTitle);
					oModel.setProperty(sAppointmentPath + "/text", sText);
					oModel.setProperty(sAppointmentPath + "/type", sType);
					oModel.setProperty(sAppointmentPath + "/startDate", oStartDate);
					oModel.setProperty(sAppointmentPath + "/endDate", oEndDate);
				} else {
					oModel.getData().appointments.push({
						title: sTitle,
						text: sText,
						type: sType,
						startDate: oStartDate,
						endDate: oEndDate
					});
				}

				oModel.updateBindings();
				
				Fragment.byId("dialogFrag","appTitle").setValue("");
				Fragment.byId("dialogFrag","moreInfo").setValue("");
			
			
				this._oNewAppointmentDialog.close();
			}
		},
	

		//stick
		cambiarHorarioCita: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				bCopy = oEvent.getParameter("copy"),
				sAppointmentTitle = oAppointment.getTitle(),
				oModel = this.getView().getModel(),
				oNewAppointment;

			if (bCopy) {
				oNewAppointment = {
					title: sAppointmentTitle,
					icon: oAppointment.getIcon(),
					text: oAppointment.getText(),
					type: oAppointment.getType(),
					startDate: oStartDate,
					endDate: oEndDate
				};
				oModel.getData().appointments.push(oNewAppointment);
				oModel.updateBindings();
			} else {
				oAppointment.setStartDate(oStartDate);
				oAppointment.setEndDate(oEndDate);
			}

			MessageToast.show("Cambio el horario de la cita \n'"
				+ sAppointmentTitle
				+ "'\n Fue " + (bCopy ? "creado" : "movido")
			);
		},

		handleAppointmentResize: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				sAppointmentTitle = oAppointment.getTitle();

			oAppointment.setStartDate(oStartDate);
			oAppointment.setEndDate(oEndDate);

			MessageToast.show("Cambio el horario de la cita \n'"
				+ sAppointmentTitle
				+ "'\n has been resized"
			);
		},

		handleAppointmentCreateDnD: function(oEvent) {
			var oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				sAppointmentTitle = "New Appointment",
				oModel = this.getView().getModel(),
				oNewAppointment = {
					title: sAppointmentTitle,
					startDate: oStartDate,
					endDate: oEndDate
				};

			oModel.getData().appointments.push(oNewAppointment);
			oModel.updateBindings();

			sap.m.MessageToast.show("Cambio el horario de la citaDnD \n'"
				+ sAppointmentTitle
				+ "'\n"
			);
		},
		verInfoCita: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate,
				oEndDate,
				oTrimmedStartDate,
				oTrimmedEndDate,
				bAllDate,
				oModel;

			if (oAppointment === undefined) {
				return;
			}

			oStartDate = oAppointment.getStartDate();
			oEndDate = oAppointment.getEndDate();
			oTrimmedStartDate = new Date(oStartDate);
			oTrimmedEndDate = new Date(oEndDate);
			bAllDate = false;
			oModel = this.getView().getModel("allDay");

			if (!oAppointment.getSelected()) {
				this._oDetailsPopover.close();
				return;
			}

			this._setHoursToZero(oTrimmedStartDate);
			this._setHoursToZero(oTrimmedEndDate);

			if (oStartDate.getTime() === oTrimmedStartDate.getTime() && oEndDate.getTime() === oTrimmedEndDate.getTime()) {
				bAllDate = true;
			}

			oModel.getData().allDay = bAllDate;
			oModel.updateBindings();

			if (!this._oDetailsPopover) {
				Fragment.load({
					id: "popoverFrag",
					name: "com.csti.Fragment.Info",
					controller: this
				})
					.then(function(oPopoverContent){
						this._oDetailsPopover = oPopoverContent;
						this._oDetailsPopover.setBindingContext(oAppointment.getBindingContext());
						this.getView().addDependent(this._oDetailsPopover);
						this._oDetailsPopover.openBy(oAppointment);
					}.bind(this));
			} else {
				this._oDetailsPopover.setBindingContext(oAppointment.getBindingContext());
				this._oDetailsPopover.openBy(oAppointment);
			}
		},
		_setHoursToZero:function (){
			return new Date(0,0,0,0)
		},
		formater:function(sDate){
				return new Date(sDate).toLocaleString();
		}
		,camera:function(){
			this.oRouter.navTo("Camera")
		},
		navChat:function(){
			this.oRouter.navTo("Detalle");
		}
	});
}, /* bExport= */ true);