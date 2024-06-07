import './App.css'

function App() {
  return (
    <>
      <div className='divPrincipal'>
        <div className='divLogin'>

          <div className='divImgLogo'>
            <h3 className='logo'>LOGO</h3>
          </div>

          <div className='divH1Login'>
            <h2 className='h1Login'>LOGIN</h2>
          </div>
        
          <div className='divInputs'>
            <div className='divConteudoInputs'>

              <div className='divInputLogin'>
                <label className='labelLogin'>Login</label>
                <input className='inputLogin' type='text' placeholder='E-mail, CPF ou Telefone'></input>
              </div>

              <div className='divInputSenha'>
                <label className='labelSenha'>Senha</label>
                <input className='inputSenha' type='password' placeholder='Senha'></input>
                <h5 className='h5Senha'><a>Esqueci minha senha</a></h5>
              </div>

            </div>
          </div>

          <div className='divButtonEntrar'>
            <button className='buttonEntrar' type='submit'>Entrar</button>
          </div>

        </div>

        <div className='divButtonCadastrar'>
          <label className='labelCadastrar'>Não possui uma conta?</label>
          <button className='buttonCadastrar' type='submit'>Cadastre-se</button>
        </div>

      </div>
    </>
  )
}

export default App
