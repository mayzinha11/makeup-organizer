const CHAVE_STORAGE = 'makeup_organizer_dados';

const produtosIniciais = [
  {
    id: 1,
    nome: 'Base Líquida Soft',
    marca: 'Fenty Beauty',
    categoria: 'pele',
    validade: '2027-05-15',
    status: 'lacrado',
    avaliacao: 4,
    lote: '4510',
    observacoes: 'Cobertura média com acabamento natural matte.'
  },
  {
    id: 2,
    nome: 'Batom Matte Velvet',
    marca: 'Rare Beauty',
    categoria: 'labios',
    validade: '2026-12-20',
    status: 'em-uso',
    avaliacao: 5,
    lote: '8921',
    observacoes: 'Textura aveludada, longa duração e acabamento matte confortável.'
  }
];

let produtos = [];
let idEmEdicao = null;

const nomesCategorias = {
  labios: 'Lábios',
  olhos: 'Olhos',
  pele: 'Pele',
  skincare: 'Skincare'
};

const nomesStatus = {
  'lacrado': 'Lacrado',
  'em-uso': 'Em uso',
  'finalizado': 'Finalizado'
};

function formatarData(dataIso) {
  if (!dataIso) return 'Não informada';
  const partes = dataIso.split('-');
  if (partes.length !== 3) return dataIso;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function carregarDoStorage() {
  const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
  if (dadosSalvos) {
    produtos = JSON.parse(dadosSalvos);
  } else {
    produtos = produtosIniciais;
    salvarNoStorage();
  }
}

function salvarNoStorage() {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(produtos));
}

function mostrarFeedback(texto, erro = false) {
  const msg = document.getElementById('mensagem-feedback');
  if (!msg) return;
  msg.textContent = texto;
  msg.style.color = erro ? '#ef4444' : '#059669';
}

function renderizarProdutos(lista = produtos) {
  const grid = document.getElementById('grid-produtos');
  const contador = document.getElementById('contador-produtos');

  contador.textContent = `${lista.length} ${lista.length === 1 ? 'item cadastrado' : 'itens cadastrados'}`;
  grid.innerHTML = '';

  if (lista.length === 0) {
    grid.innerHTML = '<p class="help-text">Nenhum produto encontrado para os critérios selecionados.</p>';
    return;
  }

  lista.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'product-card';

    const classeStatus = `status-${item.status}`;
    const textoStatus = nomesStatus[item.status] || item.status;
    const textoCategoria = nomesCategorias[item.categoria] || item.categoria;

    card.innerHTML = `
      <div class="card-status-pill ${classeStatus}">${textoStatus}</div>
      <h3>${item.nome}</h3>
      <ul class="product-info">
        <li><strong>Marca:</strong> ${item.marca}</li>
        <li><strong>Categoria:</strong> ${textoCategoria}</li>
        <li><strong>Validade:</strong> ${formatarData(item.validade)}</li>
        <li><strong>Nota:</strong> ★ ${Number(item.avaliacao).toFixed(1)}</li>
      </ul>
      <div class="card-actions">
        <button type="button" class="btn btn-sm btn-outline" data-acao="detalhes" data-id="${item.id}">Ver Detalhes</button>
        <button type="button" class="btn btn-sm btn-secondary" data-acao="editar" data-id="${item.id}">Editar</button>
        <button type="button" class="btn btn-sm btn-danger" data-acao="excluir" data-id="${item.id}">Excluir</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

const formCadastro = document.getElementById('form-cadastro');

formCadastro.addEventListener('submit', function (evento) {
  evento.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const marca = document.getElementById('marca').value.trim();
  const categoria = document.getElementById('categoria').value;
  const validade = document.getElementById('validade').value;
  const status = document.getElementById('status').value;
  const avaliacao = Number(document.getElementById('avaliacao').value);
  const lote = document.getElementById('lote').value.trim() || 'S/N';
  const observacoes = document.getElementById('observacoes').value.trim() || 'Sem observações adicionais.';

  if (!nome || !marca || !categoria || !validade) {
    mostrarFeedback('Preencha todos os campos obrigatórios (Nome, Marca, Categoria e Validade).', true);
    return;
  }

  if (avaliacao < 1 || avaliacao > 5 || isNaN(avaliacao)) {
    mostrarFeedback('A avaliação deve ser um número entre 1 e 5.', true);
    return;
  }

  if (idEmEdicao !== null) {
    const index = produtos.findIndex((p) => p.id === idEmEdicao);
    if (index !== -1) {
      produtos[index] = { id: idEmEdicao, nome, marca, categoria, validade, status, avaliacao, lote, observacoes };
    }
    idEmEdicao = null;
    document.getElementById('btn-salvar').textContent = 'Salvar Produto';
    mostrarFeedback('Produto atualizado com sucesso!');
  } else {
    const novoProduto = {
      id: Date.now(),
      nome,
      marca,
      categoria,
      validade,
      status,
      avaliacao,
      lote,
      observacoes
    };
    produtos.push(novoProduto);
    mostrarFeedback('Produto cadastrado com sucesso!');
  }

  salvarNoStorage();
  renderizarProdutos();
  formCadastro.reset();
  document.getElementById('avaliacao').value = 5;
});

carregarDoStorage();
renderizarProdutos();