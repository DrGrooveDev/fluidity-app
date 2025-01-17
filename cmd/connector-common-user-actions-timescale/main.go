package main

import (
	database "github.com/fluidity-money/fluidity-app/lib/databases/timescale/user-actions"
	"github.com/fluidity-money/fluidity-app/lib/log"
	queue "github.com/fluidity-money/fluidity-app/lib/queues/user-actions"
)

func main() {
	go queue.UserActionsEthereum(database.InsertUserAction)

	go queue.UserActionsSolana(database.InsertUserAction)

	go queue.UserActionsSui(database.InsertUserAction)

	queue.BufferedUserActionsSolana(func(bufferedUserActions queue.BufferedUserAction) {
		for _, userAction := range bufferedUserActions.UserActions {
			database.InsertUserAction(userAction)
		}
	})
}
