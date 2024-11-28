//index

import express from 'express';
import { 
    buscarHistIPCA, 
    buscarHistIPCAporAno, 
    buscarHistIPCAporId, 
    calculoHistIPCA 
} from './servicos/servicos.js';

const app = express();

const gerarErro = (res, status, mensagem) => {
    res.status(status).json({
        "status": status,
        "mensagem": mensagem
    });
};

app.get('/histIPCA', (req, res) => {
    const ano = req.query.ano;
    const resultado = (ano !== undefined) 
        ? buscarHistIPCAporAno(ano) 
        : buscarHistIPCA();

    if (resultado.length > 0) {
        res.json(resultado);
    } else if (isNaN(ano)) {
        gerarErro(res, 400, "O parâmetro 'ano' é obrigatório e deve ser válido.");
    } else {
        gerarErro(res, 404, "Não foram encontrados registros para o ano informado.");
    }
});

app.get('/histIPCA/calculo', (req, res) => {
    const valor = parseFloat(req.query.valor);
    const mesInicial = parseInt(req.query.mesInicial);
    const anoInicial = parseInt(req.query.anoInicial);
    const mesFinal = parseInt(req.query.mesFinal);
    const anoFinal = parseInt(req.query.anoFinal);

    if (isNaN(valor) || isNaN(mesInicial) || isNaN(anoInicial) || isNaN(mesFinal) || isNaN(anoFinal)) {
        return gerarErro(res, 400, "Todos os parâmetros são obrigatórios e devem ser numéricos.");
    }

    if (anoInicial > anoFinal || (anoInicial === anoFinal && mesInicial > mesFinal)) {
        return gerarErro(res, 400, "A data inicial deve ser anterior à data final.");
    }

    if (
        anoInicial < 2015 || anoFinal > 2024 || 
        mesInicial < 1 || mesInicial > 12 || 
        mesFinal < 1 || mesFinal > 12
    ) {
        return gerarErro(res, 400, "Os valores devem estar dentro dos intervalos permitidos: anos de 2015 a 2024 e meses de 1 a 12.");
    }

    const resultado = calculoHistIPCA(valor, mesInicial, anoInicial, mesFinal, anoFinal);
    res.json({ 
        "mensagem": "Cálculo realizado com sucesso.", 
        "resultado": resultado 
    });
});

app.get('/histIPCA/:id', (req, res) => {
    const id = buscarHistIPCAporId(req.params.id);

    if (id) {
        res.json(id);
    } else if (isNaN(parseInt(req.params.id))) {
        gerarErro(res, 400, "O ID fornecido deve ser um número válido.");
    } else {
        gerarErro(res, 404, "Nenhum registro encontrado para o ID fornecido.");
    }
});

app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080. Acesse http://localhost:8080");
});
