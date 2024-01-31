import React from "react";
import {Box,Tabs,Tab} from "@mui/material"

export default function BuySellSwitchTabs(props){

const {tabSwitchValue,handleTabSwitchChange}= props

    function a11yProps(index: number) {
        return {
          id: `simple-tab-${index}`,
          "aria-controls": `simple-tabpanel-${index}`,
        };
      }
    return (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs
                          value={tabSwitchValue}
                          onChange={handleTabSwitchChange}
                          aria-label="basic tabs example"
                          sx={{
                            "& .MuiTabs-indicator": {
                              background: "#fff",
                            },
                          }}
                        >
                          <Tab
                            label="Buy"
                            {...a11yProps(0)}
                            sx={{
                              "&.Mui-selected": {
                                background: "none",
                                color: "#fff",
                                paddingY:"12px",
                                height:"40px"
                              },
                              "&.MuiButtonBase-root":{
                                paddingY:"12px",
                                height:"40px",
                              }
                            
                            }}
                          />
                          <Tab
                            label="Sell"
                            {...a11yProps(1)}
                            sx={{
                              "&.Mui-selected": {
                                background: "none",
                            
                                color: "#fff",
                              },
                              "&.MuiButtonBase-root":{
                                paddingY:"12px",
                                height:"40px",
                              },
                              paddingY:"12px",
                              height:"40px",
                            }}
                          />
                        </Tabs>
                      </Box>
        </>
    )
}