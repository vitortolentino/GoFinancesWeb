import React, { useState, useEffect } from 'react';
import { parseISO, format } from 'date-fns';

import incomeSvg from '../../assets/income.svg';
import outcomeSvg from '../../assets/outcome.svg';
import totalSvg from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

interface ResponseTransactions {
  transactions: Transaction[];
  balance: Balance;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [{ income, outcome, total }, setBalance] = useState<Balance>(
    {} as Balance,
  );

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const {
        data: { balance, transactions: transactionArray },
      } = await api.get<ResponseTransactions>('/transactions');

      const formatedTransactions = transactionArray.map(
        (transaction: Transaction) => ({
          ...transaction,
          formattedValue:
            transaction.type === 'outcome'
              ? `- ${formatValue(transaction.value)}`
              : formatValue(transaction.value),
          formattedDate: format(
            parseISO(String(transaction.created_at)),
            'MM/dd/yyyy',
          ),
        }),
      );

      const formatedBalance = {
        income: formatValue(Number(balance.income)),
        outcome: formatValue(Number(balance.outcome)),
        total: formatValue(Number(balance.total)),
      };

      setBalance(formatedBalance);
      setTransactions(formatedTransactions);
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={incomeSvg} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcomeSvg} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={totalSvg} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(
                ({
                  id,
                  type,
                  title,
                  category,
                  formattedDate,
                  formattedValue,
                }: Transaction) => (
                  <tr key={id}>
                    <td className="title">{title}</td>
                    <td className={type}>{formattedValue}</td>
                    <td>{category.title}</td>
                    <td>{formattedDate}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
