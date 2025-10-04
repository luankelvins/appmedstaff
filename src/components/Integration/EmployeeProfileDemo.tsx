import React, { useState } from 'react'
import { employeeIntegrationService } from '../../services/employeeIntegrationService'
import { profileService } from '../../services/profileService'
import { UserProfile } from '../../types/profile'
import { TimeInternoForm } from '../../types/crm'

const EmployeeProfileDemo: React.FC = () => {
  const [testEmail, setTestEmail] = useState('ana.silva@medstaff.com.br')
  const [integratedProfile, setIntegratedProfile] = useState<UserProfile | null>(null)
  const [originalEmployeeData, setOriginalEmployeeData] = useState<TimeInternoForm | null>(null)
  const [loading, setLoading] = useState(false)

  const testIntegration = async () => {
    setLoading(true)
    try {
      // Buscar dados integrados do perfil
      const profile = await profileService.getProfile()
      setIntegratedProfile(profile)

      // Buscar dados originais do membro do time interno
      const employeeIntegration = await employeeIntegrationService.getEmployeeDataByEmail(testEmail)
      setOriginalEmployeeData(employeeIntegration?.employeeData || null)
    } catch (error) {
      console.error('Erro ao testar integração:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCPF = (cpf?: string) => {
    if (!cpf) return '-'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (phone?: string) => {
    if (!phone) return '-'
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '-'
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return `${age} anos`
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>
        🔗 Demonstração da Integração: Organograma → Perfil do Usuário
      </h1>

      {/* Controles de Teste */}
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ color: '#374151', marginBottom: '15px' }}>Testar Integração</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 'bold' }}>Email do Membro do Time Interno:</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              minWidth: '250px'
            }}
            placeholder="Digite o email do membro do time interno"
          />
          <button
            onClick={testIntegration}
            disabled={loading}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Testando...' : 'Testar Integração'}
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Perfil Integrado */}
        <div style={{ 
          backgroundColor: '#ecfdf5', 
          border: '1px solid #10b981', 
          borderRadius: '8px', 
          padding: '20px' 
        }}>
          <h2 style={{ color: '#065f46', marginBottom: '15px' }}>
            ✅ Perfil do Usuário (Integrado)
          </h2>
          {integratedProfile ? (
            <div style={{ fontSize: '14px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#374151', marginBottom: '10px', borderBottom: '1px solid #d1d5db', paddingBottom: '5px' }}>
                  Informações Básicas
                </h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Nome:</span>
                    <span style={{ fontWeight: 'bold' }}>{integratedProfile.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Email:</span>
                    <span style={{ fontWeight: 'bold' }}>{integratedProfile.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Cargo:</span>
                    <span style={{ fontWeight: 'bold' }}>{integratedProfile.position || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Departamento:</span>
                    <span style={{ fontWeight: 'bold' }}>{integratedProfile.department || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Employee ID:</span>
                    <span style={{ fontWeight: 'bold' }}>{integratedProfile.employeeId || 'Não integrado'}</span>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              {integratedProfile.address && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#374151', marginBottom: '10px', borderBottom: '1px solid #d1d5db', paddingBottom: '5px' }}>
                    Endereço
                  </h3>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Logradouro:</span>
                      <span style={{ fontWeight: 'bold' }}>{integratedProfile.address.street || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Cidade:</span>
                      <span style={{ fontWeight: 'bold' }}>{integratedProfile.address.city || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Estado:</span>
                      <span style={{ fontWeight: 'bold' }}>{integratedProfile.address.state || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>CEP:</span>
                      <span style={{ fontWeight: 'bold' }}>{integratedProfile.address.zipCode || '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
              Clique em "Testar Integração" para ver os dados integrados
            </p>
          )}
        </div>

        {/* Dados Originais do Membro do Time Interno */}
        <div style={{ 
          backgroundColor: '#fef3c7', 
          border: '1px solid #f59e0b', 
          borderRadius: '8px', 
          padding: '20px' 
        }}>
          <h2 style={{ color: '#92400e', marginBottom: '15px' }}>
            📋 Dados Originais do Organograma
          </h2>
          {originalEmployeeData ? (
            <div style={{ fontSize: '14px' }}>
              {/* Informações Básicas */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#374151', marginBottom: '10px', borderBottom: '1px solid #d1d5db', paddingBottom: '5px' }}>
                  Informações Básicas
                </h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Nome:</span>
                    <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosPessoais.nome}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>CPF:</span>
                    <span style={{ fontWeight: 'bold' }}>{formatCPF(originalEmployeeData.dadosPessoais.cpf)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>RG:</span>
                    <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosPessoais.rg || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Data de Nascimento:</span>
                    <span style={{ fontWeight: 'bold' }}>{formatDate(originalEmployeeData.dadosPessoais.dataNascimento)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Idade:</span>
                    <span style={{ fontWeight: 'bold' }}>{calculateAge(originalEmployeeData.dadosPessoais.dataNascimento)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Estado Civil:</span>
                    <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosPessoais.estadoCivil || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#374151', marginBottom: '10px', borderBottom: '1px solid #d1d5db', paddingBottom: '5px' }}>
                  Contato
                </h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Telefone:</span>
                    <span style={{ fontWeight: 'bold' }}>{formatPhone(originalEmployeeData.dadosPessoais.telefone)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Email Pessoal:</span>
                    <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosPessoais.emailPessoal || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              {originalEmployeeData.dadosPessoais.endereco && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#374151', marginBottom: '10px', borderBottom: '1px solid #d1d5db', paddingBottom: '5px' }}>
                    Endereço
                  </h3>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Logradouro:</span>
                      <span style={{ fontWeight: 'bold' }}>
                        {originalEmployeeData.dadosPessoais.endereco.logradouro}, {originalEmployeeData.dadosPessoais.endereco.numero}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Bairro:</span>
                      <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosPessoais.endereco.bairro}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Cidade/Estado:</span>
                      <span style={{ fontWeight: 'bold' }}>
                        {originalEmployeeData.dadosPessoais.endereco.cidade}, {originalEmployeeData.dadosPessoais.endereco.estado}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>CEP:</span>
                      <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosPessoais.endereco.cep}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Contato de Emergência */}
              {originalEmployeeData.dadosPessoais.contatoEmergencia && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#374151', marginBottom: '10px', borderBottom: '1px solid #d1d5db', paddingBottom: '5px' }}>
                    Contato de Emergência
                  </h3>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Nome:</span>
                      <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosPessoais.contatoEmergencia.nome}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Telefone:</span>
                      <span style={{ fontWeight: 'bold' }}>{formatPhone(originalEmployeeData.dadosPessoais.contatoEmergencia.telefone)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Parentesco:</span>
                      <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosPessoais.contatoEmergencia.parentesco || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Email:</span>
                      <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosPessoais.contatoEmergencia.email || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Alergias */}
              {originalEmployeeData.dadosPessoais.alergias && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#374151', marginBottom: '10px', borderBottom: '1px solid #d1d5db', paddingBottom: '5px' }}>
                    Alergias e Restrições
                  </h3>
                  <p style={{ color: '#374151', backgroundColor: '#fef3c7', padding: '8px', borderRadius: '4px' }}>
                    {originalEmployeeData.dadosPessoais.alergias}
                  </p>
                </div>
              )}

              {/* Dados Profissionais */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#374151', marginBottom: '10px', borderBottom: '1px solid #d1d5db', paddingBottom: '5px' }}>
                  Dados Profissionais
                </h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Cargo:</span>
                    <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosProfissionais.cargo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Departamento:</span>
                    <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosProfissionais.departamento}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Gestor:</span>
                    <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.dadosProfissionais.gestorResponsavel || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Data de Admissão:</span>
                    <span style={{ fontWeight: 'bold' }}>{formatDate(originalEmployeeData.dadosProfissionais.dataAdmissao)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Status:</span>
                    <span style={{ fontWeight: 'bold' }}>{originalEmployeeData.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
              {originalEmployeeData === null 
                ? 'Clique em "Testar Integração" para ver os dados do organograma'
                : 'Email não encontrado no organograma'
              }
            </p>
          )}
        </div>
      </div>

      {/* Status da Integração */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: originalEmployeeData ? '#ecfdf5' : '#fef2f2',
        border: `1px solid ${originalEmployeeData ? '#10b981' : '#ef4444'}`,
        borderRadius: '8px' 
      }}>
        <h3 style={{ color: originalEmployeeData ? '#065f46' : '#991b1b', marginBottom: '10px' }}>
          Status da Integração
        </h3>
        <p style={{ color: '#374151', margin: 0 }}>
          {originalEmployeeData 
            ? '✅ Email encontrado no organograma - Dados integrados com sucesso!'
            : '❌ Email não encontrado no organograma - Usando dados mock do perfil'
          }
        </p>
      </div>
    </div>
  )
}

export default EmployeeProfileDemo