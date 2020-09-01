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
      
      a{
        text-align: center;
        display:block;
        border-radius: 100px !important;
        color: #fff;
        background-color: #00a1bb;
        width: 200px;
        padding:10px;
        margin: 0 auto;
        text-decoration:none;
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
            <p>¡Bienvenid@! <br/>Gracias por registrarte en Inspector Hogar.</p>
            <p>Desde ahora puedes ingresar a tu cuenta en nuestra plataforma y realizar con confianza la inspección de tu nueva propiedad.</p>
            <br/>
            <br/>
            <a href="https://heml.io">Ir a Inspector Hogar</a>
          </column>
        </row>
    </container>
  </body>
</heml>
`;
}
