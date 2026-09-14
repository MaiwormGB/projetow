const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(express.json())

const pool = new Pool({

    host:'dpg-dadapj5g1s2s73fp9avg-a.oregon-postgres.render.com',
    port: 5432,
    user: "projetow_db_user",
    password: "3IAVM36k5PoW2t97TUWDNtepq9oYfI2R",
    database: "projetow_db",
    ssl: {
        rejectUnauthorized: false
    }

});

pool.query('SELECT NOW()')
    .then(() => {
        console.log('Banco conectado!');
    })
    .catch((erro) => {
        console.error('Erro ao conectar no banco:');
        console.error(erro);
    });

app.post('/login', async (request, response) => {

    const { usuario, senha} = request.body;

    const resultado = await pool.query(
        'SELECT id, nome FROM usuario WHERE nome = $1 AND senha = $2',
        [usuario, senha]

    )

    if (resultado.rows.length === 0) {

        return response.status(401).json({
            mensagem: 'Usuário ou senha incorretos'
        });
    }

        return response.json({
            mensagem: 'Login realizado!',
            usuario: resultado.rows[0]
        });

});

app.get('/', async (request, repsonse) => {
    repsonse.json({
        mensagem: "API aberta"

    });

});

app.post('/produtos', async (request, response) => {

    const { nome, complemento } = request.body;

    try {
        const resultado = await pool.query(`
            insert into produto(nome, complemento)
            values ($1, $2)
            returning *`,
            [nome, complemento]

        )

        return response.status(201).json(resultado.rows[0])

    } catch (erro){

        console.log(erro);

        return response.status(500).json({

            mensagem: "Erro ao cadastrar produto"

        })

    }


});

app.get('/produtos', async (request, response) => {

    const resultado = await pool.query(
        'SELECT id, nome, complemento FROM produto'
    );

    return response.json(resultado.rows);

});

app.put('/produtos/:id', async (request, response) => {

    const { id } = request.params;
    const { nome, complemento } = request.body;

    try {

        const resultado = await pool.query(
            `   UPDATE produto
                SET nome = $1,
                    complemento = $2
                WHERE id = $3
                RETURNING *`,
            [nome, complemento, id]
        );

        if (resultado.rows.length === 0){

            return response.status(404).json({
                mensagem: "Produto não encontrado"
            });

        }

        return response.json(resultado.rows[0])

        }catch (erro) {

            console.error(erro);

            return response.status(500).json({
                mensagem: "Erro ao atualizar produto"
            });
        }

});

app.delete('/produtos/:id', async (request, response) =>{

    const { id } = request.params;

    try {

        const resultado = await pool.query(
            'DELETE FROM produto WHERE id = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0){

            return response.status(404).json({
                mensagem: "produto não encontrado"
            })

        }

        return response.json({
            mensagem: "Produto excluído com sucesso",
            produto: resultado.rows[0]

        })

    }catch (erro) {

        console.error(erro);

        return response.status(500).json({
            mensagem: "Erro ao excluir produto"
    });
    }

})



app.get('/usuarios', async (request, response) => {

    const resultado = await pool.query(
        'SELECT id, nome FROM usuario'
    );

    return response.json(resultado.rows);
});

app.get('/registros', async (request, response) => {

    const resultado = await pool.query(
        'SELECT * FROM registro'
    );

    return response.json(resultado.rows)

});

app.post('/registros', async (request, response) => {

    const {
        usuario_id,
        produto_id,
        data_registro,
        tipo,
        quantidade
    } = request.body

    try {

        const resultado = await pool.query(
            `
            INSERT INTO registro 
            (
                usuario_id,
                produto_id,
                data_registro,
                tipo,
                quantidade
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                usuario_id,
                produto_id,
                data_registro,
                tipo,
                quantidade
            ]
        );

        return response.status(201).json(
            resultado.rows[0]
        );

    } catch (erro) {

        console.error(erro);

        return response.status(500).json({
            mensagem: "Erro ao criar registro"
        });
    }

})

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});