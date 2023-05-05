function startVideoFromCamera() {
    const videoElement = document.querySelector("#video");
    const canvasElement = document.querySelector("#canvas");
    const context = canvasElement.getContext("2d");
    let currentStream;
  
    // adicionando código para verificar se a API está sendo chamada
    console.log("API da câmera chamada com sucesso!");
  
    function gotDevices(deviceInfos) {
      // remove os dispositivos antigos
      const select = document.querySelector("#camera-select");
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
  
      // adiciona os novos dispositivos
      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "videoinput") {
          option.text = deviceInfo.label || "Câmera " + (select.length + 1);
          select.appendChild(option);
        } else {
          console.log("Outro tipo de dispositivo de entrada de vídeo / áudio detectado:", deviceInfo);
        }
      }
    }
  
    function startStream(stream) {
      currentStream = stream;
      videoElement.srcObject = currentStream;
  
      // adicionando código para visualizar o stream de vídeo
      videoElement.onloadedmetadata = function(e) {
        videoElement.play();
  
        // Define um intervalo para enviar frames do vídeo ao backend
        setInterval(() => {
          // Desenha o frame atual do vídeo no canvas
          context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
  
          // Converte o canvas em uma imagem base64
          let imageData = canvasElement.toDataURL("image/jpeg", 0.8);
  
          // Remove a parte "data:image/jpeg;base64," da string base64
          imageData = imageData.split(',')[1];
  
          // Envia o frame ao backend
          axios.post("/detect", { image_data: imageData }).then(response => {
            console.log(response.data);
          }).catch(error => {
            console.error(error);
          });
        }, 5000); // aumentei o intervalo para 500 ms
      };
    }
  
    function handleError(error) {
      console.error("Erro ao acessar a câmera: ", error);
    }
  
    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
  
    const select = document.querySelector("#camera-select");
    select.addEventListener("change", event => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        video: {
          deviceId: { exact: event.target.value }
        }
      };
      navigator.mediaDevices.getUserMedia(constraints).then(startStream).catch(handleError);
    });
  }
  window.addEventListener("DOMContentLoaded", startVideoFromCamera);
  