package handlers

import (
	"fmt"

	"github.com/labstack/echo/v4"
	"github.com/nito95/awscdk-go-template/pkg/external/postgres"
	"github.com/pkg/errors"
	"github.com/valyala/fasthttp"
)

var HealthCheck healthCheckHandler

type healthCheckHandler struct{}

func (hh healthCheckHandler) Show(c echo.Context) error {
	dbs := c.Get("dbs").(*postgres.Client)
	err := dbs.DB.Ping()
	if err != nil {
		msg := fmt.Sprintf("db connection failed")
		c.Logger().Error(errors.Wrapf(err, msg))
		return c.JSON(fasthttp.StatusServiceUnavailable, map[string]string{
			"error": msg,
		})
	}
	return c.JSON(fasthttp.StatusOK, map[string]string{
		"status": "ok",
	})
}
