module.exports = function () {
    return `
    <heml>
  <head>
    <subject>Welcome to HEML!</subject>
    <style>
      img{margin:0 auto;}
      h1{
        text-align: center;
        font-size: 20px;
        letter-spacing: 0px;
        color: #000000;
        opacity: 1;
      }
      p{
        text-align: center;
        font-size: 16px; 
        letter-spacing: 0px;
        color: #000000;
        opacity: 1;
      }
      
      span{
        text-align: center;
        display:block;
        color: #00a1bb;
        font-weight: 900;
      }
    </style>
  </head>
  <body>
    <container>
        <row>
          <column large="12">
            <img src="https://i.ibb.co/jLyjp6R/Logo-color-IH-2x.png" alt="my image" infer="retina" />
          </column>
        </row>
        <row>
          <column large="12">
            <h1>Activación de cuenta en Inspector Hogar</h1>
            <br/>
            <p>¡Hola!</p>
            <p>Hemos recibido tu solicitud pero <strong>no ha sido posible validar</strong> tu cuenta en Inspector Hogar. Los documentos adjuntados no han sido suficientes para completar el proceso. </p>
            <br/>
            <p>Nuestro equipo se pondrá en contacto a la brevedad para solicitar nueva documentación y poder validar tu cuenta.</p>
            <br/>
            <span>Inspector Hogar</span>
          </column>
        </row>
    </container>
  </body>
</heml>
`;
}
