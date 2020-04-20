sap.ui.define(
  [
    "./BaseController",
    "sap/base/Log",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "com/csti/library/main"
  ],
  function (
    BaseController,
    Log,
    Device,
    JSONModel,
    MessageBox,
    MessageToast,
    Fragment,
    main
  ) {
    "use strict";
  
    var flag = null;
    var that;
    var oView;
    var oRouter,
    count_click =0;
    return BaseController.extend("com.csti.controller.Detalle", {
      transcription: "",
      video: function(dato){
        
        var element=document.getElementById("component---detalle--self_video");
        var exit=document.getElementById("component---detalle--conjunto");
        if (dato == "element") {
          return element;
        } else if (dato == "child") {
          const child = element.firstElementChild;
          return child;
        } else if (dato == "src") {
          const child = element.firstElementChild;
          const src = child.srcObject;
          return src;
        } else if (dato == "fullscreen") {
          return exit
        } else if (dato == "header") {
          return header
        }
        },
      onInit: function () {
        var that = this;
        oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter
        .getRoute("Detalle")
        .attachPatternMatched(this.configurationInit, this);
        var oDispositivomodelo = new JSONModel(Device);
        oDispositivomodelo.setDefaultBindingMode("OneWay");
        that.getView().setModel(oDispositivomodelo, "device");
        this.llenarTablaAntecedentes();
 

      },
      configurationInit: function () {
        var that = this;
       var oView= this.getView();
       var citaData;
       var modelo = this.getOwnerComponent().getModel("citaData");
       if(modelo === undefined || modelo === null){
        oRouter.navTo("Home");
        clearInterval(that.intevalChatroom);
      }else {
        citaData = modelo.getData()[0];
        }
        //actions for phone
        this.getView().byId("ampliarCamara").setVisible(false);
        this.getView().byId("reducirCamara").setVisible(false);
        this.getView().byId("comenzarVideollamada").setEnabled(true);
        this.getView().byId("VBoxPrincipal").setVisible(true);
        this.getView().byId("VBoxPrincipal").setWidth("100%");
        this.getView().byId("VBoxCamara").setWidth("60%");
        this.getView().byId("VBoxCamara").setVisible(false);

        let header = document.getElementById("component---detalle--itbOpciones--header").offsetHeight       
        let container = this.getView().byId("VBoxPrincipal").$().height();
  
        
        if(Device.system.desktop){
          this.getView().byId("detail").setShowNavButton(false);
          this.getView().byId("VboxMensajeria").setHeight((container - header) * 0.95 + "px");
          this.getView().byId("idChat").setHeight((container - header) * 0.75 + "px");
          // this.getView().byId("detail").setShowNavButton(true);
          this.byId("AplicativoSplit").setMode("ShowHideMode");
          
        } 
        else{
          this.getView().byId("VboxMensajeria").setHeight((container - header) + "px");
          this.getView().byId("idChat").setHeight((container - header) * 0.86 + "px");
          this.byId("AplicativoSplit").setMode("HideMode");
        }
         
      this.postRequest(
        "/api/registroComunicacions/find",
        {
          idCita: citaData,
        },
        oView.byId("chatroom"),
        (result) => {
          console.log(result);
          that.citaData = citaData;
          // oView.byId("detail").setBusy(false);
          that.intevalChatroom = setInterval(() => {
            that.postRequest(
              "/api/registroComunicacions/find",
              {
                idCita: citaData,
              },
              oView.byId("chatroom"),
              () => {
                console.log(citaData.id);
              }
            );
          }, 3000);
        }
      );

      },
      onAfterRendering: function () {
          // code for change position chat in VideoCamera
      

      },
      //Retorno del objeto Split
      getObjetoSplit: function () {
        var result = this.byId("AplicativoSplit");
        if (!result) {
          Log.info("No se puede encontrar el objeto Split");
        }
        return result;
      },
      _NavBotonPrincipal: function () {
        if(this.getView().byId("VBoxCamara").getVisible()){
          sap.m.MessageBox.confirm("La llamada aun sigue activa",{
            title:"Alerta",
            actions:["OK"]
            
          })
        }else{
          oRouter.navTo("Home");
        }
      },
      _NavBotonDetail: function () {
          const tipo="navamp"
        if(!Device.system.phone){
            if(this.getView().byId("VBoxCamara").getVisible()){
              this.getView().byId("VBoxPrincipal").setWidth("40%");
              this.getView().byId("VBoxCamara").setWidth("60%");
            }else{
              this.getView().byId("VBoxPrincipal").setWidth("100%");
              this.getView().byId("VBoxCamara").setWidth("60%");
              
            }
            this.getView().byId("ampliar").setVisible(true);
            this.byId("AplicativoSplit").setMode("HideMode");
            this.adaptartamaño(tipo);
        }else{
          this.oRouter.navTo("Home");
        }
      },
 
      expandirpantalla: function (e) {
        if (Device.system.desktop) {
          // this.getView().byId("cajaContainer").setJustifyContent("Center");
          //   this.byId("idCamera").setWidth("960");
          //   this.byId("idCamera").setHeight("600");
          this.getView().byId("detail").setShowNavButton(true);
          this.byId("boxChat").setVisible(false);
          this.byId("minscreen").setVisible(true);
          this.byId("fullscreen").setVisible(false);
        }
      },
      minimizarpantalla: function () {
        if (Device.system.desktop) {
          // this.getView().byId("cajaContainer").setDirection("Row");
          //   this.byId("idCamera").setWidth("800");
          //   this.byId("idCamera").setHeight("594");
          this.byId("boxChat").setVisible(true);
          this.byId("minscreen").setVisible(false);
          this.byId("fullscreen").setVisible(true);
        }
      },
      activarCam: function () {

        count_click += 1;
        this.getView().byId("comenzarVideollamada").setEnabled(false);

        if (Device.system.phone) {
     
          this.getView().byId("VBoxPrincipal").setVisible(false);
          this.getView().byId("VBoxCamara").setVisible(true);
          this.getView().byId("VBoxCamara").setWidth("100%");
          this.getView().byId("detail").setShowNavButton(false);
          this.callVideoChat();
     
        }
        if (!Device.system.phone) {
          this.getView().byId("detail").setShowNavButton(true);
          this.getView().byId("ampliarCamara").setVisible(true);
          this.byId("VBoxCamara").setWidth("60%");
          this.byId("VBoxCamara").setVisible(true);
          this.callVideoChat();

        }
      },
      cancelarLlamada: function (room) {
        
        this.getView().byId("activarDesactivarSwitchCamara").setState(true);

        this.getView().byId("VBoxCamara").setVisible(false);
        this.getView().byId("VBoxPrincipal").setVisible(true);
        this.getView().byId("VBoxPrincipal").setWidth("100%");
        this.getView().byId("comenzarVideollamada").setEnabled(true);
        this.getView().byId("reducirCamara").setVisible(false);
        this.getView().byId("ampliarCamara").setVisible(false);
        if(!Device.system.phone) {
          this.byId("AplicativoSplit").setMode("ShowHideMode");
          this.getView().byId("detail").setShowNavButton(false);
        } else{
          this.byId("AplicativoSplit").setMode("HideMode");
          this.getView().byId("detail").setShowNavButton(true);
          
        }

      },
      guardarCita: function () {
        MessageBox.show(
          "Realmente deseas finalizr la cita \n Se procederemos a cerrar la sesión",
          {
            title: "Finalizar Cita",
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          }
        );
      },    
      //codigoVideocam
      callVideoChat: function () {
        that = this;
        oView = this.getView();
        oView.setBusy(true);
        //Extraccion de token de seguridad necesario para conectarse al room indicado
        fetch("https://ancient-gorge-00265.herokuapp.com/token", {
          method: "POST",
          headers: new Headers({
            "Content-type": "application/json",
          }),
          body: JSON.stringify({
            identity: "Nqweqr",
            room: "devroom",
          }),
        })
          .then((res) => res.json())
          .then((tokenData) => {
            if (navigator.mediaDevices === undefined) {
              var connConfig = {
                audio: true,
                video: {
                  width: 150,
                  height: 150,
                },
              };
              that.initialSetUpVideoCall(null, tokenData, connConfig);
            } else {
              console.log(tokenData);
              navigator.mediaDevices.enumerateDevices().then((devices) => {
                console.log(devices);
                //Obtener los dispositivos media por default
                var audioInput = devices.find(
                  (device) => device.kind === "audioinput"
                );
                var videoInput = devices.find(
                  (device) => device.kind === "videoinput"
                );
                //Analizar si el video existe para asociar el TRACK al elemento HTML
                var videoInputSetting;
                if (videoInput === undefined) {
                  videoInputSetting = false;
                } else {
                  videoInputSetting = {
                    deviceId: videoInput.deviceId,
                    width: 150,
                    height: 150,
                  };
                }
                var connConfig = {
                  audio: { audio: { deviceId: audioInput.deviceId } },
                  video: videoInputSetting,
                };
                that.initialSetUpVideoCall(devices, tokenData, connConfig);
              });
            }
          });
      },
      initialSetUpVideoCall: function (devices, tokenData, connConfig) {
        const tipo = "navred";
        //Otorgar modelos de dispositivos a los combos
        if (devices !== null) {
          // that.attachModelCombo(devices);
        }

        //Objeto principal de la libreria Twilio
        var videotw = Twilio.Video;
        //Asociar el TRACK VIDEO al elemento HTML para hacer un previw de su video
        if (connConfig.video !== false) {
          videotw.createLocalVideoTrack().then((track) => {
            
            const localMediaContainer = document.getElementById(
              // video principal
              "component---detalle--video_user_2"
              // "application-telemedicinadoctor-Display-component---detalle--self_video"
            );
            
            localMediaContainer.appendChild(track.attach());

          });
        }        
        //Creacion de Local tracks para la trasnmision de video y audio
        return videotw
          .createLocalTracks(connConfig)
          .then((localTracks) => {
            //Realizar la coneccion al ROOM con el token y el nombre del room
            console.log(localTracks);
            videotw
              .connect(tokenData.token, {
                name: tokenData.room,
                tracks: localTracks,
              })
              .then((room) => {
                console.log(`Successfully joined a Room: ${room}`);
                console.log("ROOM INFO", room);
                //Evento para desconectar al usuario cuando cambie de view
                window.addEventListener("hashchange", () => {
                  // room.disconnect();
                });
                //Asociar los differentes eventos para el ROOM
                that.attachEventHandlers(room);

                //Asociar funcionalidad del los componentes basicos
                that.attachFunctionComponets(room, videotw);
                
                // call fx of adaptabled
                that.adaptartamaño(tipo);

                if(!Device.system.phone){
                  that.getView().byId("VBoxPrincipal").setWidth("40%");
                }
                //Desactivar busy indicator para el inicio de la interaccion del usuario
                // that.getView().byId("VBoxPrincipal").setWidth("40%");
                oView.setBusy(false);
              });
          })
          .catch((e) => {
            alert(e);
          });
      },
      attachEventHandlers: function (roomSubs) {
        roomSubs.on(
          "participantConnected",
          (participant) => {
            console.log(`A remote Participant connected: ${participant}`);
          },
          (error) => {
            console.error(`Unable to connect to Room: ${error.message}`);
          }
        );

        roomSubs.on("trackSubscribed", (track) => {
          console.log("trackSubscribed Event");
          console.log(track);
          if (track.kind === "audio") {
            var value = track.attach();
            console.log("VALOR DEL TRACK.ATTACH", value);
          } else if (track.kind === "video") {
            document
              .getElementById(
                // camara pequeña
                "component---detalle--self_video"
              // "application-telemedicinadoctor-Display-component---detalle--video_user_2"
              )
              .appendChild(track.attach());
          }
        });

        roomSubs.on("participantDisconnected", (participant) => {
          console.log(participant);
          console.log(`Participant disconnected: ${participant.identity}`);
        });

        roomSubs.on("disconnected", (room) => {
          // Detach the local media elements
          room.localParticipant.tracks.forEach((publication) => {
            const attachedElements = publication.track.detach();
            attachedElements.forEach((element) => element.remove());
            publication.track.stop();
          });
        });
      },
      extractDevicesList: function (devices, kind) {
        var result = [];
        var resultListName = [];
        devices.forEach((item) => {
          var splitedString = item.label.split("-");
          var name =
            splitedString.length === 1 ? splitedString[0] : splitedString[1];
          console.log(name);
          if (resultListName.includes(name) === false && item.kind === kind) {
            resultListName.push(name);
            result.push(item);
          }
        });
        return result;
      },
      attachModelCombo: function (devices) {
        console.log(devices);
        var listDivicesVideo = devices.filter((item) => {
          if (item.kind === "videoinput") {
            return item;
          }
        });
        console.log(listDivicesVideo);
        var listDivicesAudioInput = devices.filter((item) => {
          if (item.kind === "audioinput") {
            return item;
          }
        });
        var listDivicesAudio = devices.filter((item) => {
          if (item.kind === "audiooutput") {
            return item;
          }
        });
        var combo_audio = oView.byId("audio_combo_output");
        combo_audio.setModel(new JSONModel(listDivicesAudio));
        var combo_audio_input = oView.byId("audio_combo_input");
        combo_audio_input.setModel(new JSONModel(listDivicesAudioInput));
        var combo_video = oView.byId("video_combo_input");
        combo_video.setModel(new JSONModel(listDivicesVideo));
        if (listDivicesAudio.length !== 0) {
          combo_audio.setSelectedKey(listDivicesAudio[0].deviceId);
        }
        if (listDivicesAudioInput.length !== 0) {
          combo_audio_input.setSelectedKey(listDivicesAudioInput[0].deviceId);
        }
        if (listDivicesVideo.length !== 0) {
          console.log("set");
          combo_video.setSelectedKey(listDivicesVideo[0].deviceId);
        }
      },
      attachFunctionComponets: function (room, videotw) { 
        var that = this;
        //Evento para cambiar el dispositivo de salida de audio.
        // var combo_audio = oView.byId("audio_combo_output");
        // combo_audio.attachChange({}, () => {
        //   var key = combo_audio.getSelectedKey();
        //   room.participants.forEach((parti) => {
        //     var audioTracks = parti.audioTracks;
        //     audioTracks.forEach((audio) => {
        //       console.log(audio);
        //       audio.track.detach();
        //       console.log("Room Data", room);
        //       const audioElement = audio.track.attach();
        //       audioElement.setSinkId(key).then(() => {
        //         document.body.appendChild(audioElement);
        //       });
        //     });
        //   });
        // });

        // ----------------------------------------------------
        //Evento para cambiar el dispositivo de entrada de audio.
        // var combo_audio_input = oView.byId("audio_combo_input");
        // combo_audio_input.attachChange({}, () => {
        //   var key = combo_audio_input.getSelectedKey();
        //   var newAudioTrack = videotw
        //     .createLocalAudioTrack({
        //       deviceId: { exact: key },
        //     })
        //     .then((audioTrack) => {
        //       console.log("New Track Audio", audioTrack);
        //       var localParticipant = room.localParticipant;
        //       var tracks = Array.from(localParticipant.audioTracks.values());
        //       tracks = tracks.map((item) => item.track);
        //       console.log("Lista de TRACKS", tracks);
        //       localParticipant.unpublishTracks(tracks);
        //       tracks.forEach((item) => {
        //         item.stop();
        //       });
        //       localParticipant.publishTrack(audioTrack);
        //       console.log("New state ROOM", room);
        //     });
        // });

        // ----------------------------------------------------
        //Evento para cambiar el dispositivo de entrada de video.
        // var combo_video_input = oView.byId("video_combo_input");
        // combo_video_input.attachChange({}, async () => {
        //   var key = combo_video_input.getSelectedKey();
        //   console.log(key);
        //   var selfInfo = room.localParticipant;
        //   console.log(selfInfo);
        //   var videoTrack = selfInfo.videoTracks;
        //   console.log(videoTrack);
        //   var tracks = Array.from(videoTrack.values());

        //   console.log(tracks);
        //   var tracks = tracks.map((item) => {
        //     item.track.stop();
        //     return item.track;
        //   });
        //   console.log(tracks);
        //   selfInfo.unpublishTracks(tracks);

        //   tracks.forEach((item) => {
        //     console.log(item);
        //     item.detach();
        //     item.mediaStreamTrack.stop();
        //     item.stop();
        //   });
        //   var selfVideo = document.getElementById(
        //     "component---Video--self_video"
        //   );
        //   var stream = selfVideo.firstElementChild.srcObject;
        //   const elementTracks = stream.getTracks();
        //   elementTracks.forEach(function (track) {
        //     track.stop();
        //   });
        //   selfVideo.firstElementChild.srcObject = null;
        //   selfVideo.removeChild(selfVideo.firstElementChild);
        //   var newVideoTrack = videotw
        //     .createLocalVideoTrack({
        //       deviceId: { exact: key },
        //     })
        //     .then((localVideoTrack) => {
        //       console.log(localVideoTrack);
        //       selfVideo.appendChild(localVideoTrack.attach());
        //       console.log(room);
        //     });
        //   console.log(room);
        // });

        // ----------------------------------------------------
        //Evento para apagar la camara temporarlmete
        // var video_mute_button = oView.byId("video_mute_button");
        // video_mute_button.attachPress({}, () => {
        var video_mute_button = oView.byId("activarDesactivarSwitchCamara");
        video_mute_button.attachChange({}, (oEvent) => {
          var switchElement =oEvent.getSource();
          var videotw = Twilio.Video;
          if(!switchElement.getState()){
            var publications = Array.from(
              room.localParticipant.videoTracks.values()
              );
          console.log(publications);
          publications.forEach((item) => {
            var track = item.track;
            track.stop();
           });
            var stream = this.video("src");
            const elementTracks = stream.getTracks();
            elementTracks.forEach(function(track){
                track.stop();
            });
            var objeto = this.video("src");
            objeto = null;
            this.video("element").removeChild(this.video("child"));
          }else{
            videotw.createLocalVideoTrack()
                .then((localVideoTrack)=>{
                  this.video("element").appendChild(localVideoTrack.attach());
                  const child = this.video("child");
                  const ancho = that.getView().byId("VBoxCamara").$().width();
                  const alto = that.getView().byId("VBoxCamara").$().height();
                  if(!Device.system.phone){
                      if( child=== null || child === undefined){
                        child.style.height = "auto";
                        child.style.width = ancho + "px"; 
                      }
                  }else{
                    if( child=== null || child === undefined){
                      child.style.height = "auto";
                      child.style.width = ancho + "px"; 
                    }
                  }
                })
          }
          console.log(room);
        });
        // ----------------------------------------------------
        //Evento para apagar el audio temporarlmete
        var audio_mute_button = oView.byId("activarDesactivarSwitchMicrophone");
        audio_mute_button.attachChange({}, () => {
          console.log(room);
          console.log(room.localParticipant);
          console.log(room.localParticipant);
          var publications = Array.from(
            room.localParticipant.audioTracks.values()
          );
          console.log(publications);
          publications.forEach((item) => {
            console.log(item.track);
            var track = item.track;
            console.log(track.isEnabled);
            if (track.isEnabled) {
              console.log("hpña");
              track.disable();
            } else {
              console.log("hp2ña");
              track.enable();
            }
          });
          console.log(room);
        });
        // ----------------------------------------------------
        //Evento para salir de la conferencia.
        // var colgar_button = oView.byId("colgar_button");

        var colgar_button = oView.byId("cancelarLlamada");
        colgar_button.attachPress({}, () => {
  
          MessageBox.show("Realmente deseas salir de la videollamada",{
            title:"VideoLLamada",
            actions:[MessageBox.Action.YES,MessageBox.Action.NO],
            onClose:function(oAction){
              if(oAction==="YES"){        
                console.log(oAction);
                that.cancelarLlamada(room);
                room.disconnect();
                var selfVideo = document.getElementById(
                  "component---detalle--self_video"
                );
                var stream = selfVideo.firstElementChild.srcObject;
                const elementTracks = stream.getTracks();
                elementTracks.forEach(function (track) {
                  track.stop();
                });
                selfVideo.firstElementChild.srcObject = null;
                selfVideo.removeChild(selfVideo.firstElementChild);


              }
            }
          })
          // alert("Saliste de la llamada");
        });
      },
      llenarTablaAntecedentes:function(){
        var oView= this.getView();
       this.getView().setModel(new JSONModel(jQuery.sap.getModulePath("com.csti.data","/data.json")),"modeloAntecedentes");

        var model= this.getView().getModel("modeloAntecedentes");
        model.attachRequestCompleted(null,()=>{
          oView.byId("tablaAntecedentes").setModel(model);
        })
        // oView.byId("tablaAntecedentes").setModel();
      },
      envioMensaje: function(){
        var that = this;  
        var mensaje = this.getView().byId("fImensaje").getValue();
        var objMensajeNuevo = {
          estado: "1",
          fechaEnvio: that.dateTimeDBFormatter(),
          fechaRegistro: that.dateTimeDBFormatter(),
          idCita: that.citaData,
          mensaje: mensaje,
          usuarioRegistro: `${that.citaData.idDoctorDisponibilidad.idDoctor.nombre} ${that.citaData.idDoctorDisponibilidad.idDoctor.apellidoPaterno}`,
        };
        console.log(objMensajeNuevo);
        this.postRequest(
          "/api/registroComunicacions/create",
          objMensajeNuevo
        );
      },
      adaptartamaño:function(type){
        const child= this.video("child");
        console.log(child)
        if(type == "ampliar"){
          const alto = this.getView().byId("VBoxCamara").$().height();
        
            if (child !== undefined || child !== null) {
              child.style.height=screen.height+"px";
              child.style.width=screen.width+"px";
              this.openFullscreen(this.video("fullscreen"));
            }
        } else if(type=="reducir"){
          const ancho = this.getView().byId("VBoxCamara").$().width();
          const alto = this.getView().byId("VBoxCamara").$().height();
          
          if (!Device.system.phone) {
            if (child !== undefined || child !== null) {
              child.style.height = "auto";
              child.style.width = ancho + "px";
              this.closeFullscreen();
            }
            } else {
              if (child !== undefined || child !== null) {
                child.style.height = "auto";
                child.style.width = ancho + "px";
              }
            }
        }else {
            const ancho = this.getView().byId("VBoxCamara").$().height();
            const alto = this.getView().byId("VBoxCamara").$().width();
          
            if(!Device.system.phone){
              if(child != undefined || child != null){
                child.style.height = "auto";
                child.style.width = ancho + "px";
              }
            } else {
              if(child != undefined || child != null){
                child.style.height = "auto";
                child.style.width = ancho + "px";
              
              }
          }
      }
     },
     openFullscreen:function(elem){
      $(elem).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function (e) {
        //do something;
      });
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
     },
     closeFullscreen:function() {
      console.log("close")
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
     },
     ampliar: function () {
      const tipo = "navred"
      this.getView().byId("detail").setShowNavButton(true);
      this.byId("AplicativoSplit").setMode("ShowHideMode");
      this.getView().byId("ampliar").setVisible(false);
      this.adaptartamaño(tipo);
    },
    ampliarCamara: function (oEvent) {
      const tipo = "ampliar";
      this.getView().byId("detail").setShowNavButton(false);
      this.byId("AplicativoSplit").setMode("HideMode");
      this.getView().byId("ampliar").setVisible(false);
      this.getView().byId("VBoxPrincipal").setVisible(false);
      this.getView().byId("VBoxCamara").setVisible(true);
      this.getView().byId("VBoxCamara").setWidth("100%");
      this.getView().byId("VBoxCamara").setHeight("100%");
      this.getView().byId("ampliarCamara").setVisible(false);
      this.getView().byId("reducirCamara").setVisible(true);

      this.adaptartamaño(tipo);
    },
    reducirCamara: function () {
      const tipo = "reducir";
      this.getView().byId("ampliar").setVisible(false);
      this.byId("AplicativoSplit").setMode("ShowHideMode");
      this.getView().byId("VBoxPrincipal").setVisible(true);
      this.getView().byId("VBoxPrincipal").setWidth("100%");
      this.getView().byId("VBoxCamara").setWidth("60%");
      this.getView().byId("detail").setShowNavButton(true);
      this.getView().byId("ampliarCamara").setVisible(true);
      this.getView().byId("reducirCamara").setVisible(false);

      this.adaptartamaño(tipo);
    },
    });
  }
);
