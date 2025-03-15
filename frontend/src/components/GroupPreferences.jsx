import * as React from "react";
import FormControl from "@mui/material/FormControl";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useAddProjPreferencesMutation, useGetAllProjectsQuery, useRemoveProjPreferencesMutation } from "../features/projects/projectsApiSlice";
import { PulseLoader } from "react-spinners";
import { Snackbar } from "@mui/material";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function GroupPreferences ({ group }) {
  const [selectedPrefs, setSelectedPrefs] = React.useState(group.projectPreferences);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [message, setMessage] = React.useState('')

  const {
    data: projects,
    isSuccess: isGetSuccess,
    isLoading: isGetLoading,
    error: getError,
  } = useGetAllProjectsQuery();

  const [addPref, {
    isSuccess: isAddSuccess,
    isLoading: isAddLoading,
    isError: isAddError,
    error: addError
  }] = useAddProjPreferencesMutation()

  const [removePref, {
    isSuccess: isRemoveSuccess,
    isLoading: isRemoveLoading,
    isError: isRemoveError,
    error: removeError
  }] = useRemoveProjPreferencesMutation();



  React.useEffect(() => {
    if (isAddSuccess) {
      setSnackbarOpen(true);
      setMessage("Successfully added preference.");
    }
  }, [isAddSuccess]);

  React.useEffect(() => {
    if (isRemoveSuccess) {
      setSnackbarOpen(true)
      setMessage("Successfully removed preference.")
    }
  }, [isRemoveSuccess])

  React.useEffect(() => {
    if (isAddError) {
      setMessage(addError)
      setSnackbarOpen(true)
    }
  }, [isAddError])

  React.useEffect(() => {
    if (isRemoveError) {
      setMessage(removeError)
      setSnackbarOpen(true)
    }
  }, [isRemoveError])

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
    setMessage("")
  }

  const handleChange = (event, newValue) => {
    if (newValue?.length <= 7) {
        setSelectedPrefs(newValue)
    }
  };


  let prefIds = [];
  if (isGetSuccess) {
    prefIds = projects.ids.filter((id) => projects.entities[id].courseId === group.courseId)
  }

  const handleSubmitPrefs = (e) => {
    e.preventDefault();
    const newPrefSet = new Set(selectedPrefs);
    const oldPrefSet = new Set(group.projectPreferences);
    for (let projectId of newPrefSet.difference(oldPrefSet)) {
      addPref({ groupId: group.id, projectId });

    }
    for (let projectId of oldPrefSet.difference(newPrefSet)) {
      removePref({ groupId: group.id, projectId })
    }
  };

  if (isGetLoading) {
    return <PulseLoader/>
  }
  if (getError) {
    return <div>Unable to get projects: {getError}</div>
  }

  if (removeError) {
    return <div>Unable to remove projects: {removeError}</div>
  }

  return (
    <div>
      <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
        <Autocomplete
          multiple
          id="tags-standard"
          options={prefIds}
          disableCloseOnSelect
          getOptionLabel={(projectId) => projects ? projects.entities[projectId].name : projectId}
          value={selectedPrefs}
          onChange={handleChange}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {projects ?`${projects.entities[option].name}` : `${option}`}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Project Preferences (up to 7)"
            />
          )}
        />

        <button type="submit" className="button--secondary" onClick={handleSubmitPrefs}>
          { (isAddLoading || isRemoveLoading) ? <PulseLoader /> : 'Change Project Preferences' }
        </button>
      </FormControl>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={message}
      />
    </div>
  );
}
