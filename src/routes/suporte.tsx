import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  HeartHandshake, 
  ArrowLeft, 
  AlertTriangle, 
  CreditCard, 
  Clock, 
  Flame, 
  ChevronDown, 
  Mail, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { MobileTabbar } from '@/components/mobile-tabbar'
import { cn } from '@/lib/utils'

export type SupportTab = 'ajuda' | 'termos' | 'privacidade' | 'jogo-responsavel'

export const Route = createFileRoute('/suporte')({
  validateSearch: (search: Record<string, unknown>): { tab?: SupportTab } => {
    const validTabs: SupportTab[] = ['ajuda', 'termos', 'privacidade', 'jogo-responsavel']
    const tab = typeof search.tab === 'string' && validTabs.includes(search.tab as SupportTab)
      ? (search.tab as SupportTab)
      : 'ajuda'
    return { tab }
  },
  component: SuportePage,
})

function SuportePage() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  const urlParam = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('tab') as SupportTab | null)
    : null

  const activeTab: SupportTab = urlParam || search.tab || 'ajuda'

  const setTab = (tab: SupportTab) => {
    navigate({
      to: '/suporte',
      search: { tab },
    })
  }

  // Accordion state for FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index))
  }

  const openDeposit = () => {
    document.dispatchEvent(new CustomEvent('open-deposit-modal'))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pt-6 pb-28 lg:px-8 lg:pb-16">
        {/* Navegação e Título */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Início
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Central de Informações & Suporte
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tudo o que você precisa saber sobre a BodeBet: ajuda, regulamento, privacidade e jogo responsável.
              </p>
            </div>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-1.5 bg-card/70 border border-border/60 rounded-2xl shadow-lg">
          <button
            type="button"
            onClick={() => setTab('ajuda')}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeTab === 'ajuda'
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Central de Ajuda</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('termos')}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeTab === 'termos'
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Termos de Uso</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('privacidade')}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeTab === 'privacidade'
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Privacidade</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('jogo-responsavel')}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all border",
              activeTab === 'jogo-responsavel'
                ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                : "text-rose-400 border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300"
            )}
          >
            <HeartHandshake className="w-4 h-4 shrink-0" />
            <span>Jogo Responsável</span>
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}

        {/* 1. CENTRAL DE AJUDA */}
        {activeTab === 'ajuda' && (
          <div className="flex flex-col gap-8 animate-in fade-in-50 duration-300">
            {/* Destaques Rápidos */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-card/70 border border-border/60 p-5 rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Depósitos via Pix</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Aprovações automáticas e instantâneas via QR Code Pix. O saldo cai na sua conta em poucos segundos.
                </p>
                <button
                  onClick={openDeposit}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 mt-auto flex items-center gap-1 text-left"
                >
                  Depositar agora &rarr;
                </button>
              </div>

              <div className="bg-card/70 border border-border/60 p-5 rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Saques Rápidos</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Solicite seus saques diretamente para sua chave Pix CPF. Processamento seguro de 2 a 15 minutos.
                </p>
                <button
                  onClick={() => navigate({ to: '/carteira' })}
                  className="text-xs font-bold text-primary hover:text-primary/80 mt-auto flex items-center gap-1 text-left"
                >
                  Acessar carteira &rarr;
                </button>
              </div>

              <div className="bg-card/70 border border-border/60 p-5 rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Códigos Promocionais</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Utilize códigos cadastrados no painel para dobrar o valor do seu depósito automaticamente.
                </p>
                <span className="text-xs font-bold text-amber-400 mt-auto">
                  Válido na tela de depósito
                </span>
              </div>
            </div>

            {/* Perguntas Frequentes (FAQ) */}
            <div className="bg-card/60 border border-border/60 rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Perguntas Frequentes (FAQ)
              </h2>

              <div className="flex flex-col gap-3 mt-2">
                {[
                  {
                    q: 'Como faço para depositar na BodeBet?',
                    a: 'Basta clicar no botão amarelo "Depositar" no topo da página ou na sua Carteira, digitar o valor desejado (mínimo de R$ 10,00), aplicar um cupom de bônus se houver e efetuar o pagamento via Pix copiando a chave ou escaneando o QR Code pelo app do seu banco. A confirmação é instantânea.'
                  },
                  {
                    q: 'Qual o valor mínimo e tempo para saques?',
                    a: 'Os saques podem ser solicitados a partir da aba Carteira. O valor é enviado diretamente para a chave Pix CPF do titular cadastrado, garantindo total segurança contra fraudes. O tempo de processamento típico é de poucos minutos.'
                  },
                  {
                    q: 'Os jogos são seguros e justos?',
                    a: 'Sim. Todos os slots da PG Soft utilizam algoritmos oficiais certificados e homologados internacionalmente, com RTP de 96% a 97%. Nossos jogos originais (Mines e Double) utilizam sistemas matemáticos transparentes de geração de números pseudoaleatórios.'
                  },
                  {
                    q: 'Posso transferir saldo para outra pessoa?',
                    a: 'Não. Por conformidade com as regras de prevenção à fraude e lavagem de capitais, todos os depósitos e saques devem ser efetuados exclusivamente por contas bancárias vinculadas ao mesmo CPF cadastrado na conta do jogador.'
                  },
                  {
                    q: 'O que fazer caso tenha alguma dúvida ou problema?',
                    a: 'Nossa equipe de suporte está disponível pelo e-mail oficial suporte@bodebet.site e canais de atendimento 24 horas por dia.'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-white/10 rounded-xl overflow-hidden bg-background/50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-white hover:text-primary transition-colors"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 shrink-0 transition-transform duration-200 text-muted-foreground",
                          openFaq === idx && "transform rotate-180 text-primary"
                        )}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className="p-4 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-white/5">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Canal de Atendimento */}
            <div className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Precisa de suporte personalizado?</h3>
                  <p className="text-xs text-muted-foreground">
                    Envie uma mensagem diretamente para nossa central de atendimento.
                  </p>
                </div>
              </div>
              <a
                href="mailto:suporte@bodebet.site"
                className="bg-white/10 hover:bg-white/20 border border-white/15 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all active:scale-95 shrink-0"
              >
                suporte@bodebet.site
              </a>
            </div>
          </div>
        )}

        {/* 2. TERMOS DE USO */}
        {activeTab === 'termos' && (
          <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
            <div className="bg-card/70 border border-border/60 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 leading-relaxed">
              <div className="border-b border-border/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Termos e Condições Gerais de Uso
                </h2>
                <span className="text-xs text-muted-foreground">Última atualização: Setembro de 2026</span>
              </div>

              <div className="space-y-6 text-sm text-muted-foreground">
                <section className="space-y-2">
                  <h3 className="font-bold text-base text-white">1. Aceitação e Elegibilidade</h3>
                  <p>
                    Ao acessar a plataforma BodeBet e registrar uma conta, o usuário declara ter pelo menos <strong>18 (dezoito) anos de idade completos</strong> e possuir plena capacidade civil para contratar e assumir obrigações nos termos da legislação brasileira. O uso da plataforma é estritamente pessoal e intransferível.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-base text-white">2. Cadastro e Integridade de Dados</h3>
                  <p>
                    O usuário se compromete a fornecer informações cadastrais verídicas, completas e atualizadas, incluindo nome completo, CPF, e-mail e telefone celular. É expressamente proibida a criação de múltiplas contas por um mesmo indivíduo. Caso sejam detectadas contas duplicadas ou com dados fraudulentos, a BodeBet reserva-se o direito de suspender imediatamente os acessos.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-base text-white">3. Depósitos e Saques</h3>
                  <p>
                    Todas as operações financeiras são realizadas por meio do sistema oficial de pagamentos instantâneos (Pix). O titular da conta bancária de origem do depósito e de destino do saque deve ser estritamente coincidente com o CPF cadastrado na plataforma BodeBet. Operações destinadas a contas de terceiros não serão autorizadas.
                  </p>
                  <p>
                    Para fins de conformidade e prevenção à lavagem de capitais, valores depositados devem ser utilizados na plataforma de jogos antes de eventuais solicitações de saque.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-base text-white">4. Bônus e Campanhas Promocionais</h3>
                  <p>
                    A plataforma pode disponibilizar códigos promocionais e bonificações. Cada cupom possui regras próprias de ativação, validade e rollover de apostas. A manipulação indevida ou tentativa de abuso de bonificações ensejará o cancelamento dos saldos promocionais concedidos.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-base text-white">5. Condutas Vedadas</h3>
                  <p>
                    É estritamente proibido o emprego de robôs (bots), softwares de aposta automatizada, engenharia reversa ou qualquer mecanismo que explore falhas técnicas para obter vantagens indevidas. Violações acarretarão encerramento definitivo da conta e comunicação às autoridades pertinentes.
                  </p>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* 3. POLÍTICA DE PRIVACIDADE */}
        {activeTab === 'privacidade' && (
          <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
            <div className="bg-card/70 border border-border/60 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 leading-relaxed">
              <div className="border-b border-border/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  Política de Privacidade e Proteção de Dados (LGPD)
                </h2>
                <span className="text-xs text-muted-foreground">Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</span>
              </div>

              <div className="space-y-6 text-sm text-muted-foreground">
                <section className="space-y-2">
                  <h3 className="font-bold text-base text-white">1. Informações Coletadas</h3>
                  <p>
                    A BodeBet coleta apenas as informações fundamentais para a criação da sua conta e execução dos serviços de entretenimento e transações Pix:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Dados de Identificação: Nome completo e número do Cadastro de Pessoas Físicas (CPF);</li>
                    <li>Dados de Contato: Endereço de e-mail e número de telefone celular;</li>
                    <li>Registros Financeiros: Histórico de depósitos e saques processados via Pix;</li>
                    <li>Dados de Navegação: Endereço IP, tipo de dispositivo e registros de logs para segurança.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-base text-white">2. Finalidade do Tratamento</h3>
                  <p>
                    Seus dados pessoais são utilizados exclusivamente para:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Verificação de autenticidade e validação de idade mínima (18+);</li>
                    <li>Processamento ágil e seguro de depósitos e pagamentos de prêmios;</li>
                    <li>Prevenção a fraudes, invasões de conta e lavagem de dinheiro;</li>
                    <li>Atendimento e suporte técnico solicitado pelo próprio usuário.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-base text-white">3. Segurança e Criptografia</h3>
                  <p>
                    Empregamos protocolos modernos de segurança de ponta a ponta (criptografia SSL/TLS 256 bits), bancos de dados com isolamento por usuário (Row Level Security no Supabase) e infraestrutura de nuvem segura com firewalls ativos para impedir qualquer acesso não autorizado.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-base text-white">4. Não Compartilhamento com Terceiros</h3>
                  <p>
                    A BodeBet não comercializa, não aluga e não repassa seus dados cadastrais para parceiros de marketing ou quaisquer terceiros desautorizados. O compartilhamento ocorre estritamente com os processadores oficiais do arranjo de pagamentos Pix para efetivação das suas transações financeiras.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-base text-white">5. Direitos do Titular de Dados</h3>
                  <p>
                    Você pode, a qualquer momento, solicitar a consulta, retificação ou exclusão de suas informações da nossa base, ressalvadas as obrigações legais de guarda de registros financeiros impostas pelas autoridades competentes.
                  </p>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* 4. JOGO RESPONSÁVEL COM ENORME ÊNFASE */}
        {activeTab === 'jogo-responsavel' && (
          <div className="flex flex-col gap-8 animate-in fade-in-50 duration-300">
            {/* MEGA DESTAQUES DE ALERTA OBRIGATÓRIOS */}
            <div className="grid gap-5 md:grid-cols-2">
              
              {/* ALERTA 1: PROIBIDO PARA MENORES DE 18 ANOS */}
              <div className="relative overflow-hidden bg-gradient-to-br from-rose-950/80 via-rose-900/30 to-background border-2 border-rose-500 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-rose-600/40 border border-rose-400">
                    18+
                  </div>
                  <div>
                    <span className="text-[0.65rem] uppercase font-black tracking-widest text-rose-400">
                      Legislação & Controle Etário
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                      Proibido para Menores
                    </h2>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-white/90 leading-relaxed space-y-2 border-t border-rose-500/30 pt-4">
                  <p className="font-semibold text-rose-200">
                    O acesso, cadastro e aposta na BodeBet são TERMINANTEMENTE PROIBIDOS para menores de 18 (dezoito) anos de idade.
                  </p>
                  <p>
                    Adotamos verificação ativa e rigorosa de dados cadastrais e CPF. Quaisquer contas vinculadas a menores de idade identificadas no sistema serão imediatamente bloqueadas e os saldos cancelados.
                  </p>
                  <p className="text-xs text-rose-300/80 italic">
                    Recomendamos o uso de softwares de controle parental (como Net Nanny, Qustodio ou CyberPatrol) em dispositivos compartilhados com crianças ou adolescentes.
                  </p>
                </div>
              </div>

              {/* ALERTA 2: APOSTA NÃO É INVESTIMENTO */}
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-950/80 via-amber-900/30 to-background border-2 border-amber-500 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/40 border border-amber-300">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[0.65rem] uppercase font-black tracking-widest text-amber-400">
                      Aviso de Consciência Financeira
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                      Aposta Não é Investimento
                    </h2>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-white/90 leading-relaxed space-y-2 border-t border-amber-500/30 pt-4">
                  <p className="font-bold text-amber-200 text-base">
                    Apostas online são EXCLUSIVAMENTE uma atividade de entretenimento e diversão.
                  </p>
                  <p>
                    <strong>NUNCA</strong> encare apostas como fonte de renda, investimento financeiro ou garantia de remuneração. Todo jogo possui margem matemática e envolve risco real de perda de capital.
                  </p>
                  <p className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-amber-200 font-semibold text-xs">
                    JAMAIS aposte quantias destinadas a contas básicas, moradia, alimentação, educação ou saúde. Jogue apenas o dinheiro que você pode destinar ao seu lazer.
                  </p>
                </div>
              </div>

            </div>

            {/* DIRETRIZES DE JOGO RESPONSÁVEL */}
            <div className="bg-card/70 border border-border/60 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <HeartHandshake className="w-6 h-6 text-primary" />
                  Regras de Ouro para o Jogo Consciente
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Mantenha sempre o controle da sua diversão e siga essas diretrizes em qualquer aposta:
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-background/60 border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Defina um Orçamento Fixo</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Determine antes de começar quanto pode gastar naquele dia ou semana e pare imediatamente ao atingir o limite.
                    </p>
                  </div>
                </div>

                <div className="bg-background/60 border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Não Tente Recuperar Perdas</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Aceite as oscilações naturais dos jogos. Dobrar apostas para tentar "recuperar" é o caminho mais comum para perdas indesejadas.
                    </p>
                  </div>
                </div>

                <div className="bg-background/60 border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Estabeleça Limites de Tempo</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Faça pausas regulares. Jogar por horas ininterruptas prejudica o julgamento crítico e a capacidade de tomada de decisão.
                    </p>
                  </div>
                </div>

                <div className="bg-background/60 border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Nunca Jogue sob Alteração Emocional</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Não realize apostas em momentos de tristeza, raiva, ansiedade ou sob influência de bebidas alcoólicas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FERRAMENTAS DE AUTOPROTEÇÃO & AUTOEXCLUSÃO */}
            <div className="bg-card/70 border border-border/60 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-xl">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Ferramentas de Proteção e Autoexclusão
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Se você sentir que está perdendo o controle sobre seus hábitos de aposta ou que o jogo deixou de ser diversão, a BodeBet oferece mecanismos imediatos para a sua proteção:
              </p>

              <div className="grid gap-3 sm:grid-cols-3 mt-2">
                <div className="bg-background/50 border border-white/10 p-4 rounded-2xl">
                  <h4 className="font-bold text-sm text-white">Pausa Temporária</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Suspensão temporária da sua conta por 24 horas, 7 dias ou 30 dias para reflexão e descanso.
                  </p>
                </div>

                <div className="bg-background/50 border border-white/10 p-4 rounded-2xl">
                  <h4 className="font-bold text-sm text-white">Limites Personalizados</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Restrição automática de valores máximos de depósito diário, semanal ou mensal.
                  </p>
                </div>

                <div className="bg-background/50 border border-white/10 p-4 rounded-2xl">
                  <h4 className="font-bold text-sm text-white text-rose-400">Autoexclusão Definitiva</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bloqueio permanente e irreversível da sua conta para preservar sua saúde financeira.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 mt-2">
                <p className="text-xs text-white/80">
                  Para solicitar pausa temporária ou autoexclusão imediata da sua conta, contate nosso time:
                </p>
                <a
                  href="mailto:suporte@bodebet.site?subject=Solicitacao%20de%20Autoexclusao%20-%20BodeBet"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all active:scale-95 shrink-0 shadow-lg shadow-rose-600/30"
                >
                  Solicitar Autoexclusão
                </a>
              </div>
            </div>

            {/* ONDE BUSCAR AJUDA ESPECIALIZADA */}
            <div className="bg-gradient-to-r from-card/80 to-background border border-border/60 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                Onde Buscar Ajuda Especializada (Apoio Gratuito)
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                A dependência em jogos de azar (ludopatia) é uma condição de saúde tratável. Existem entidades de apoio gratuito e anônimo prontas para ajudar você ou seus familiares:
              </p>

              <div className="grid gap-4 sm:grid-cols-2 mt-2">
                <a
                  href="https://jogadoresanonimos.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-background/60 hover:bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between transition-all"
                >
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                      Jogadores Anônimos do Brasil
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Reuniões de apoio presenciais e virtuais em todo o Brasil.
                    </p>
                    <span className="text-[0.7rem] text-primary mt-1 inline-block">jogadoresanonimos.com.br &rarr;</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-3" />
                </a>

                <div className="bg-background/60 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      CVV — Centro de Valorização da Vida
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Apoio emocional confidencial e gratuito, 24 horas por dia.
                    </p>
                    <span className="text-[0.7rem] text-emerald-400 font-bold mt-1 inline-block">Ligue 188 (Ligação Gratuita)</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 ml-3 font-bold text-xs">
                    188
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <SiteFooter />
      <MobileTabbar />
    </div>
  )
}
