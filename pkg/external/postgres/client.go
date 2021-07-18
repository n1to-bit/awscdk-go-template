package postgres

import (
	"database/sql"

	"github.com/labstack/echo/v4"

	_ "github.com/lib/pq"
)

type Client struct {
	DB *sql.DB
}

func ClientBuilder(databaseURL string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			db, err := sql.Open("postgres", databaseURL)
			if err != nil {
				return err
			}
			err = db.Ping()
			if err != nil {
				return err
			}
			d := Client{DB: db}
			defer d.DB.Close()

			c.Set("dbs", &d)
			if err := next(c); err != nil {
				return err
			}
			return nil
		}
	}
}
