// Copyright 2022 Fluidity Money. All rights reserved. Use of this
// source code is governed by a GPL-style license that can be found in the
// LICENSE.md file.

package solana

import (
	"fmt"

	"github.com/fluidity-money/fluidity-app/lib/log"
	"github.com/fluidity-money/fluidity-app/lib/postgres"
)

// GetIntermediateWinner using a payout transaction signature
func GetIntermediateWinner(payoutSignature string) (winningSignature string) {
	databaseClient := postgres.Client()

	statementText := fmt.Sprintf(
		`SELECT  winning_signature
		FROM %s
		WHERE payout_signature = $1;`,

		TableIntermediateWinners,
	)

	row := databaseClient.QueryRow(statementText, payoutSignature)

	if err := row.Err(); err != nil {
		log.Fatal(func(k *log.Log) {
			k.Context = Context

			k.Format(
				"Failed to query for an intermediate winner with payout sig %v",
				payoutSignature,
			)

			k.Payload = err
		})
	}

	err := row.Scan(&winningSignature)

	if err != nil {
		log.Fatal(func(k *log.Log) {
			k.Context = Context

			k.Format(
				"Failed to scan the intermediate winners table for payout signature %v",
				payoutSignature,
			)

			k.Payload = err
		})
	}

	return winningSignature
}

// InsertIntermediateWinner to use later in comparing the winners to the database
func InsertIntermediateWinner(winningSignature, payoutSignature string) {
	databaseClient := postgres.Client()

	statementText := fmt.Sprintf(
		`INSERT INTO %v (
			winning_signature,
			payout_signature
		)
		VALUES (
			$1,
			$2
		)`,

		TableIntermediateWinners,
	)

	_, err := databaseClient.Exec(statementText, winningSignature, payoutSignature)

	if err != nil {
		log.Fatal(func(k *log.Log) {
			k.Context = Context

			k.Format(
				"Failed to insert an intermediate winner with payout sig %v",
				payoutSignature,
			)

			k.Payload = err
		})
	}
}
