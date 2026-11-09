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

function exibirDetalhes(id) {
  const produto = produtos.find((p) => p.id === id);
  if (!produto) return;

  const containerDetalhes = document.getElementById('conteudo-detalhes');
  const textoCategoria = nomesCategorias[produto.categoria] || produto.categoria;
  const textoStatus = nomesStatus[produto.status] || produto.status;

  containerDetalhes.innerHTML = `
    <h3>${produto.nome} – ${produto.marca}</h3>
    <div class="details-list">
      <p><strong>Categoria:</strong> ${textoCategoria}</p>
      <p><strong>Status:</strong> ${textoStatus}</p>
      <p><strong>Lote:</strong> ${produto.lote || 'Não informado'}</p>
      <p><strong>Validade:</strong> ${formatarData(produto.validade)}</p>
      <p><strong>Avaliação:</strong> ★ ${Number(produto.avaliacao).toFixed(1)} / 5.0</p>
      <p><strong>Observações:</strong> ${produto.observacoes || 'Nenhuma observação cadastrada.'}</p>
    </div>
  `;
}

function prepararEdicao(id) {
  const produto = produtos.find((p) => p.id === id);
  if (!produto) return;

  document.getElementById('nome').value = produto.nome;
  document.getElementById('marca').value = produto.marca;
  document.getElementById('categoria').value = produto.categoria;
  document.getElementById('validade').value = produto.validade;
  document.getElementById('status').value = produto.status;
  document.getElementById('avaliacao').value = produto.avaliacao;
  document.getElementById('lote').value = produto.lote || '';
  document.getElementById('observacoes').value = produto.observacoes || '';

  idEmEdicao = produto.id;
  document.getElementById('btn-salvar').textContent = 'Atualizar Produto';
  mostrarFeedback(`Editando "${produto.nome}". Altere os dados e clique em Atualizar Produto.`);
  window.location.hash = '#cadastro';
}

function excluirProduto(id) {
  produtos = produtos.filter((p) => p.id !== id);
  salvarNoStorage();
  renderizarProdutos();
  mostrarFeedback('Produto removido da coleção.');
}

document.getElementById('grid-produtos').addEventListener('click', function (evento) {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;

  const acao = botao.getAttribute('data-acao');
  const id = Number(botao.getAttribute('data-id'));

  if (acao === 'detalhes') exibirDetalhes(id);
  if (acao === 'editar') prepararEdicao(id);
  if (acao === 'excluir') excluirProduto(id);
});

function aplicarFiltrosEOrdenacao() {
  const termo = document.getElementById('busca').value.toLowerCase().trim();
  const categoriaSelecionada = document.getElementById('filtro-categoria').value;
  const criterioOrdem = document.getElementById('ordenar').value;

  const filtrados = produtos.filter((item) => {
    const bateBusca =
      item.nome.toLowerCase().includes(termo) ||
      item.marca.toLowerCase().includes(termo);
    const bateCategoria =
      categoriaSelecionada === 'todas' || item.categoria === categoriaSelecionada;

    return bateBusca && bateCategoria;
  });

  filtrados.sort((a, b) => {
    if (criterioOrdem === 'nome') {
      return a.nome.localeCompare(b.nome);
    }
    if (criterioOrdem === 'validade') {
      return (a.validade || '9999-12-31').localeCompare(b.validade || '9999-12-31');
    }
    if (criterioOrdem === 'avaliacao') {
      return b.avaliacao - a.avaliacao;
    }
    return 0;
  });

  renderizarProdutos(filtrados);
}

document.getElementById('busca').addEventListener('input', aplicarFiltrosEOrdenacao);
document.getElementById('filtro-categoria').addEventListener('change', aplicarFiltrosEOrdenacao);
document.getElementById('ordenar').addEventListener('change', aplicarFiltrosEOrdenacao);
document.getElementById('btn-filtrar').addEventListener('click', aplicarFiltrosEOrdenacao);

const btnBuscarApi = document.getElementById('btn-buscar-api');
const inputBuscaApi = document.getElementById('busca-api');
const containerApi = document.getElementById('lista-api');
let cacheApi = [];

async function consultarApiCosmeticos() {
  containerApi.innerHTML = '<p class="help-text">Carregando produtos da API pública...</p>';
  const termo = inputBuscaApi.value.toLowerCase().trim();

  try {
    const resposta = await fetch('https://dummyjson.com/products/category/beauty');
    const dados = await resposta.json();

    cacheApi = dados.products.filter((prod) =>
      prod.title.toLowerCase().includes(termo) ||
      (prod.brand && prod.brand.toLowerCase().includes(termo))
    );

    containerApi.innerHTML = '';

    if (cacheApi.length === 0) {
      containerApi.innerHTML = '<p class="help-text">Nenhum cosmético encontrado na API para esse termo.</p>';
      return;
    }

    cacheApi.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'product-card';

      card.innerHTML = `
        <div class="card-status-pill status-lacrado">Catálogo API</div>
        <h3>${item.title}</h3>
        <ul class="product-info">
          <li><strong>Marca:</strong> ${item.brand || 'Glow Beauty'}</li>
          <li><strong>Nota Média:</strong> ★ ${Number(item.rating).toFixed(1)}</li>
          <li><strong>Código SKU:</strong> ${item.sku || 'API-' + item.id}</li>
        </ul>
        <div class="card-actions">
          <button type="button" class="btn btn-sm btn-primary" data-id-api="${item.id}">+ Adicionar à Minha Coleção</button>
        </div>
      `;

      containerApi.appendChild(card);
    });
  } catch (erro) {
    containerApi.innerHTML = '<p class="help-text">Não foi possível carregar os dados da API no momento.</p>';
  }
}

btnBuscarApi.addEventListener('click', consultarApiCosmeticos);

containerApi.addEventListener('click', function (evento) {
  const botao = evento.target.closest('button[data-id-api]');
  if (!botao) return;

  const idApi = Number(botao.getAttribute('data-id-api'));
  const itemApi = cacheApi.find((p) => p.id === idApi);
  if (!itemApi) return;

  const novoItem = {
    id: Date.now(),
    nome: itemApi.title,
    marca: itemApi.brand || 'Glow Beauty',
    categoria: 'pele',
    validade: '2027-12-31',
    status: 'lacrado',
    avaliacao: Math.min(5, Math.max(1, Math.round(itemApi.rating))),
    lote: itemApi.sku || `API-${itemApi.id}`,
    observacoes: itemApi.description
  };

  produtos.push(novoItem);
  salvarNoStorage();
  renderizarProdutos();
  mostrarFeedback(`"${itemApi.title}" foi importado da API para a sua coleção!`);
});